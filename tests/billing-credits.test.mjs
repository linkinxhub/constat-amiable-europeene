import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {reserveTestCredit,settleTestCredit,withTestCredit} from '../server/billing-credits.ts';
import {readTestCredits} from '../server/billing-flow.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const reportId='report_credits_123456';
const op=(kind='sketch')=>({id:randomUUID(),reportId,kind});
async function fixture(){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'credit-test'},cf:false}),db=await mf.getD1Database('DB');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 await db.prepare("INSERT INTO accounts(id,created_at) VALUES ('owner','test'),('other','test')").run();
 await db.prepare("INSERT INTO reports(owner_id,id,revision,object_key,title,accident_date,updated_at,retention_until) VALUES ('owner',?,1,'key','test','test','test',?)").bind(reportId,Date.now()+3600000).run();
 const order=randomUUID();
 await db.prepare("INSERT INTO billing_test_orders(id,owner_id,report_id,locale,created_at) VALUES (?,'owner',?,'fr',?)").bind(order,reportId,Date.now()).run();
 await db.prepare("INSERT INTO billing_test_grants(order_id,state,credits,expires_at,created_at) VALUES (?,'granted',10,?,?)").bind(order,Date.now()+3600000,Date.now()).run();
 return {mf,db};
}
test('thirty concurrent sketch/translation requests share ten reservations, failure releases once',async()=>{
 const {mf,db}=await fixture();try{
  const ops=Array.from({length:30},(_,i)=>op(i%2?'translation':'sketch'));
  const results=await Promise.allSettled(ops.map(o=>reserveTestCredit(db,'owner',o)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,10);
  assert.equal(await readTestCredits(db,'owner',reportId),0);
  const index=results.findIndex(r=>r.status==='fulfilled');
  await settleTestCredit(db,'owner',ops[index].id,false);await settleTestCredit(db,'owner',ops[index].id,false);
  assert.equal(await readTestCredits(db,'owner',reportId),1);
  await reserveTestCredit(db,'owner',op());assert.equal(await readTestCredits(db,'owner',reportId),0);
 }finally{await mf.dispose()}
});
test('same operation executes work once; confirmed success cannot be refunded or re-run',async()=>{
 const {mf,db}=await fixture();try{
  const operation=op();let calls=0;
  const results=await Promise.allSettled(Array.from({length:12},()=>withTestCredit(db,'owner',operation,async()=>{calls++;return 'stored'})));
  assert.equal(calls,1);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(await readTestCredits(db,'owner',reportId),9);
  await assert.rejects(settleTestCredit(db,'owner',operation.id,false));
  await assert.rejects(withTestCredit(db,'owner',operation,async()=>{calls++}));assert.equal(calls,1);
 }finally{await mf.dispose()}
});
test('failed generation restores availability and another owner cannot reserve or settle it',async()=>{
 const {mf,db}=await fixture();try{
  const operation=op();await assert.rejects(withTestCredit(db,'owner',operation,async()=>{throw Error('provider failed')}),/provider failed/);
  assert.equal(await readTestCredits(db,'owner',reportId),10);
  await assert.rejects(reserveTestCredit(db,'other',op()));
  const pending=op();await reserveTestCredit(db,'owner',pending);
  await assert.rejects(settleTestCredit(db,'other',pending.id,false));
  assert.equal(await readTestCredits(db,'owner',reportId),9);
  await assert.rejects(reserveTestCredit(db,'owner',{...pending,kind:'translation'}));
 }finally{await mf.dispose()}
});
test('settlement storage failure preserves the hold instead of granting a free successful result',async()=>{
 const {mf,db}=await fixture();try{
  const operation=op();let calls=0;
  const broken={prepare(sql){if(sql.includes('UPDATE billing_test_uses'))throw Error('storage failure');return db.prepare(sql)}};
  await assert.rejects(withTestCredit(broken,'owner',operation,async()=>{calls++;return 'stored'}),/storage failure/);
  assert.equal(calls,1);assert.equal(await readTestCredits(db,'owner',reportId),9);
  assert.equal((await db.prepare('SELECT state FROM billing_test_uses').first()).state,'reserved');
  await settleTestCredit(db,'owner',operation.id,true);
  assert.equal(await readTestCredits(db,'owner',reportId),9);
 }finally{await mf.dispose()}
});
test('suspension and expiry prevent new work but allow settlement of existing holds',async()=>{
 const {mf,db}=await fixture();try{
  const operation=op();await reserveTestCredit(db,'owner',operation);
  await db.prepare("UPDATE accounts SET status='suspended' WHERE id='owner'").run();
  await assert.rejects(reserveTestCredit(db,'owner',op()));await settleTestCredit(db,'owner',operation.id,false);
  await db.prepare("UPDATE accounts SET status='active' WHERE id='owner'").run();
  assert.equal(await readTestCredits(db,'owner',reportId),10);
  await db.prepare('UPDATE reports SET retention_until=1').run();
  await assert.rejects(reserveTestCredit(db,'owner',op()));assert.equal(await readTestCredits(db,'owner',reportId),0);
 }finally{await mf.dispose()}
});
