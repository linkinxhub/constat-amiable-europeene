import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {createTestOrder,readTestOrder,attachTestSession,recordTestConfirmation} from '../server/billing-orders.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
async function fixture(){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'billing-test'},cf:false});
 const db=await mf.getD1Database('DB');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const s of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(s.trim())await db.prepare(s.trim()).run();
 for(const owner of ['a','b']){
  await db.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?)').bind(owner,'2026-09-21').run();
  await db.prepare('INSERT INTO reports(owner_id,id,revision,object_key,title,accident_date,updated_at,retention_until) VALUES (?,?,1,?, ?,?,?,?)').bind(owner,'report_'+owner+'_1234567890','key_'+owner,'Synthetic','2026-09-21','2026-09-21',Date.now()+3600000).run();
 }
 return {mf,db};
}
test('concurrent requests reuse one immutable owner/report order and reject cross-owner access',async()=>{
 const {mf,db}=await fixture();try{
  const orders=await Promise.all(Array.from({length:16},()=>createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'fr'})));
  assert.equal(new Set(orders.map(o=>o.id)).size,1);
  assert.equal((await createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'de'})).locale,'fr');
  await assert.rejects(readTestOrder(db,'b',orders[0].id),e=>e.status===404);
  await assert.rejects(createTestOrder(db,'b',{reportId:'report_a_1234567890',locale:'fr'}));
  await assert.rejects(createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'fr',amount:1}));
  await db.prepare("UPDATE accounts SET status='suspended' WHERE id='a'").run();
  await assert.rejects(createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'fr'}));
 }finally{await mf.dispose()}
});
test('session binding is immutable, owner-scoped and rejects expired reports',async()=>{
 const {mf,db}=await fixture();try{
  const order=await createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'fr'});
  await assert.rejects(attachTestSession(db,'b',order.id,'cs_test_other'));
  await assert.rejects(attachTestSession(db,'a',order.id,'cs_live_other'));
  await attachTestSession(db,'a',order.id,'cs_test_one');
  await attachTestSession(db,'a',order.id,'cs_test_one');
  await assert.rejects(attachTestSession(db,'a',order.id,'cs_test_two'));
  await db.prepare('UPDATE reports SET retention_until=1').run();
  await assert.rejects(createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'fr'}));
  await assert.rejects(attachTestSession(db,'a',order.id,'cs_test_one'));
 }finally{await mf.dispose()}
});
test('duplicate signed confirmations record exactly one receipt and cannot cross orders',async()=>{
 const {mf,db}=await fixture();try{
  const a=await createTestOrder(db,'a',{reportId:'report_a_1234567890',locale:'fr'});
  const b=await createTestOrder(db,'b',{reportId:'report_b_1234567890',locale:'en'});
  const confirmation={eventId:'evt_one',sessionId:'cs_test_one',orderId:a.id};
  await assert.rejects(recordTestConfirmation(db,confirmation));
  await attachTestSession(db,'a',a.id,'cs_test_one');await attachTestSession(db,'b',b.id,'cs_test_two');
  const results=await Promise.all(Array.from({length:20},()=>recordTestConfirmation(db,confirmation)));
  assert.equal(results.filter(r=>r.recorded).length,1);
  assert.equal((await recordTestConfirmation(db,{...confirmation,eventId:'evt_alternate'})).recorded,false);
  await assert.rejects(recordTestConfirmation(db,{...confirmation,orderId:b.id,sessionId:'cs_test_two'}));
  await assert.rejects(recordTestConfirmation(db,{...confirmation,eventId:'evt_wrong',sessionId:'cs_test_two'}));
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_receipts').first()).n,1);
  assert.equal((await recordTestConfirmation(db,{eventId:'evt_two',sessionId:'cs_test_two',orderId:b.id})).recorded,true);
  // Billing evidence must not prevent the existing report-retention cleanup.
  await db.prepare("DELETE FROM reports WHERE owner_id='a'").run();
  assert.equal((await recordTestConfirmation(db,confirmation)).recorded,false);
 }finally{await mf.dispose()}
});
