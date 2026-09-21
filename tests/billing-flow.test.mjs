import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {createHmac,randomUUID} from 'node:crypto';
import {startTestPurchase,handleTestPayment,readTestCredits} from '../server/billing-flow.ts';
import {testStripeClient} from '../server/stripe-test.ts';
import config from '../server/billing-test-prices.json' with {type:'json'};
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const secret='whsec_'+randomUUID(),reportId='report_flow_1234567890';
async function fixture(){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'flow-test'},cf:false});
 const db=await mf.getD1Database('DB');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 await db.prepare("INSERT INTO accounts(id,created_at) VALUES ('owner','2026-09-21'),('other','2026-09-21')").run();
 await db.prepare("INSERT INTO reports(owner_id,id,revision,object_key,title,accident_date,updated_at,retention_until) VALUES ('owner',?,1,'key','Synthetic','2026-09-21','2026-09-21',?)").bind(reportId,Date.now()+48*3600000).run();
 const state={session:null,creates:0,keys:[],loseOnce:false};
 const client={webhooks:testStripeClient('rk_test_syntheticfixture').webhooks,
 accounts:{retrieve:async()=>({id:config.account})},
 prices:{retrieve:async()=>({id:config.prices.report,object:'price',active:true,livemode:false,currency:'eur',unit_amount:690,tax_behavior:'inclusive',type:'one_time',billing_scheme:'per_unit',custom_unit_amount:null,transform_quantity:null,recurring:null,metadata:{accordia_sku:'report'}})},
 checkout:{sessions:{
 create:async(params,options)=>{state.creates++;state.keys.push(options.idempotencyKey);state.session??={id:'cs_test_flow',object:'checkout.session',livemode:false,mode:'payment',currency:'eur',amount_total:690,status:'open',payment_status:'unpaid',client_reference_id:params.client_reference_id,metadata:params.metadata,url:'https://checkout.stripe.com/c/pay/fixture'};if(state.loseOnce){state.loseOnce=false;throw Error('response lost')}return state.session},
 retrieve:async()=>state.session,
 }}};
 function message(patch={}){const raw=JSON.stringify({id:'evt_flow',livemode:false,type:'checkout.session.completed',data:{object:{...state.session,status:'complete',payment_status:'paid',...patch}}});const now=Math.floor(Date.now()/1000);return [raw,`t=${now},v1=${createHmac('sha256',secret).update(`${now}.${raw}`).digest('hex')}`,secret]}
 return {mf,db,client,state,message};
}
test('stored Checkout is reused and a completed browser return grants no credits',async()=>{
 const {mf,db,client,state}=await fixture();try{
  const first=await startTestPurchase(db,client,'owner',{reportId,locale:'fr'});
  assert.equal(first.state,'open');
  assert.deepEqual(await startTestPurchase(db,client,'owner',{reportId,locale:'de'}),first);
  assert.equal(state.creates,1);
  state.session.status='complete';state.session.payment_status='paid';
  assert.equal((await startTestPurchase(db,client,'owner',{reportId,locale:'fr'})).state,'pending_confirmation');
  assert.equal(await readTestCredits(db,'owner',reportId),0);
  state.session.status='expired';await assert.rejects(startTestPurchase(db,client,'owner',{reportId,locale:'fr'}),e=>e.code==='checkout_expired');
 }finally{await mf.dispose()}
});
test('lost provider response retries with the same order and idempotency key',async()=>{
 const {mf,db,client,state}=await fixture();try{
  state.loseOnce=true;
  await assert.rejects(startTestPurchase(db,client,'owner',{reportId,locale:'fr'}),/response lost/);
  await startTestPurchase(db,client,'owner',{reportId,locale:'de'});
  assert.equal(new Set(state.keys).size,1);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_orders').first()).n,1);
 }finally{await mf.dispose()}
});
test('signed concurrent confirmations grant ten test credits once and preserve reduced balance',async()=>{
 const {mf,db,client,message}=await fixture();try{
  const purchase=await startTestPurchase(db,client,'owner',{reportId,locale:'fr'});
  const args=message();
  await Promise.all(Array.from({length:20},()=>handleTestPayment(db,client,...args)));
  assert.equal(await readTestCredits(db,'owner',reportId),10);
  assert.equal(await readTestCredits(db,'other',reportId),0);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_grants').first()).n,1);
  await db.prepare('UPDATE billing_test_grants SET credits=7').run();
  await handleTestPayment(db,client,...args);
  assert.equal(await readTestCredits(db,'owner',reportId),7);
  assert.equal((await startTestPurchase(db,client,'owner',{reportId,locale:'fr'})).state,'confirmed');
  await db.prepare("UPDATE accounts SET status='suspended' WHERE id='owner'").run();
  await assert.rejects(readTestCredits(db,'owner',reportId));
  await db.prepare("UPDATE accounts SET status='active' WHERE id='owner'").run();
  await db.prepare('UPDATE reports SET retention_until=1').run();
  assert.equal(await readTestCredits(db,'owner',reportId),0);
  assert.equal((await db.prepare('SELECT order_id FROM billing_test_grants').first()).order_id,purchase.orderId);
 }finally{await mf.dispose()}
});
test('crash after receipt is recoverable without duplicate grant',async()=>{
 const {mf,db,client,message}=await fixture();try{
  await startTestPurchase(db,client,'owner',{reportId,locale:'fr'});
  const args=message();
  const broken={prepare(sql){if(sql.includes('INSERT INTO billing_test_grants'))throw Error('storage unavailable');return db.prepare(sql)}};
  await assert.rejects(handleTestPayment(broken,client,...args),/storage unavailable/);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_receipts').first()).n,1);
  assert.equal(await readTestCredits(db,'owner',reportId),0);
  assert.equal((await handleTestPayment(db,client,...args)).state,'granted');
  assert.equal(await readTestCredits(db,'owner',reportId),10);
 }finally{await mf.dispose()}
});
test('late payment records a review case without reopening expired report',async()=>{
 const {mf,db,client,message}=await fixture();try{
  await startTestPurchase(db,client,'owner',{reportId,locale:'fr'});
  await db.prepare('UPDATE reports SET retention_until=1').run();
  assert.equal((await handleTestPayment(db,client,...message())).state,'review_required');
  assert.equal(await readTestCredits(db,'owner',reportId),0);
  assert.equal((await db.prepare('SELECT credits FROM billing_test_grants').first()).credits,0);
 }finally{await mf.dispose()}
});
test('invalid signature cannot write receipts; old uncertain order cannot create a new payment',async()=>{
 const {mf,db,client,state,message}=await fixture();try{
  state.loseOnce=true;await assert.rejects(startTestPurchase(db,client,'owner',{reportId,locale:'fr'}));
  const [raw,,signingSecret]=message();await assert.rejects(handleTestPayment(db,client,raw,'invalid',signingSecret));
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_receipts').first()).n,0);
  await db.prepare('UPDATE billing_test_orders SET created_at=?').bind(Date.now()-24*3600000).run();
  await assert.rejects(startTestPurchase(db,client,'owner',{reportId,locale:'fr'}),e=>e.code==='checkout_reconciliation_required');
  assert.equal(state.creates,1);
 }finally{await mf.dispose()}
});
