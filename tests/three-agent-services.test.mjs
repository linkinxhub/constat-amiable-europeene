import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {writeReport} from '../server/report-service.ts';
import {createSession,joinSession,readSession,updateSession} from '../server/session-service.ts';
import {prepareFinal,signFinal,finalPdf,finalizePdf} from '../server/final-service.ts';
import {pdfFixture} from './pdf-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const signature='data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64');
async function fixture(fn){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'audit-three-agents'},r2Buckets:['BUCKET'],cf:false});
 try{const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')};
  for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await stores.db.prepare(sql.trim()).run();
  const report=pdfFixture();await writeReport(stores,'owner',report.id,{report,expectedRevision:0});await fn(stores,report);
 }finally{await mf.dispose();}
}
test('A01: real completion A/B and two signatures finalize within the six-write minute',()=>fixture(async(stores,r)=>{
 const originalNow=Date.now,fixed=originalNow();Date.now=()=>fixed;
 try{
  // Put the initial write in the same fixed minute without bypassing completion flags.
  await stores.db.prepare('UPDATE accounts SET rate_window=?,rate_writes=1 WHERE id=?').bind(Math.floor(fixed/60000),'owner').run();
  const session=await createSession(stores,'owner',r.id);await joinSession(stores,'guest',session.id,session.token);
  for(const actor of ['owner','guest']){const cur=await readSession(stores,actor,session.id);await updateSession(stores,actor,session.id,{report:cur.report,expectedRevision:cur.revision,finish:true});}
  const current=await readSession(stores,'owner',session.id);assert.ok(current.progress.A.done&&current.progress.B.done);
  const doc=await prepareFinal(stores,'owner',session.id,{style:'keyboard',lang:'fr',expectedRevision:current.revision});
  const input={digest:doc.digest,consent:true,kind:'drawn',data:signature};
  await signFinal(stores,'owner',session.id,doc.id,input);
  const done=await signFinal(stores,'guest',session.id,doc.id,input);assert.equal(done.ready,true);assert.ok(done.signedA&&done.signedB);
  const before=await finalPdf(stores,'owner',session.id,doc.id);assert.equal(before.signed,true);
  await signFinal(stores,'guest',session.id,doc.id,input);await finalizePdf(stores,'owner',session.id,doc.id);
  assert.deepEqual((await finalPdf(stores,'guest',session.id,doc.id)).bytes,before.bytes);
  const account=await stores.db.prepare('SELECT rate_writes,budget_bytes FROM accounts WHERE id=?').bind('owner').first();assert.equal(account.rate_writes,6);assert.ok(account.budget_bytes>=before.bytes.length);
 }finally{Date.now=originalNow;}
}));
test('A02: report expiration at invitation commit neither joins nor consumes its token',()=>fixture(async(stores,r)=>{
 const session=await createSession(stores,'owner',r.id);
 const before=await stores.db.prepare('SELECT invite_hash FROM shared_sessions WHERE id=?').bind(session.id).first();
 const racing={...stores,db:{prepare(sql){const stmt=stores.db.prepare(sql);if(!sql.startsWith('UPDATE shared_sessions SET participant_b = ?'))return stmt;return {bind(...args){const bound=stmt.bind(...args);return {async run(){await stores.db.prepare('UPDATE reports SET retention_until=1 WHERE id=?').bind(r.id).run();return bound.run();}};}};}}};
 await assert.rejects(joinSession(racing,'guest',session.id,session.token),e=>e.code==='invite_invalid');
 const after=await stores.db.prepare('SELECT participant_b,invite_hash FROM shared_sessions WHERE id=?').bind(session.id).first();assert.equal(after.participant_b,null);assert.equal(after.invite_hash,before.invite_hash);
 await assert.rejects(readSession(stores,'guest',session.id),e=>e.status===404);
}));
test('A01: an explicit retry after final storage failure still obeys quota and keeps signatures',()=>fixture(async(stores,r)=>{
 const session=await createSession(stores,'owner',r.id);await joinSession(stores,'guest',session.id,session.token);
 for(const actor of ['owner','guest']){const cur=await readSession(stores,actor,session.id);await updateSession(stores,actor,session.id,{report:cur.report,expectedRevision:cur.revision,finish:true});}
 const cur=await readSession(stores,'owner',session.id),doc=await prepareFinal(stores,'owner',session.id,{style:'keyboard',lang:'fr',expectedRevision:cur.revision});
 const input={digest:doc.digest,consent:true,kind:'drawn',data:signature};await signFinal(stores,'owner',session.id,doc.id,input);
 let attempts=0;const failing={...stores,bucket:{get:k=>stores.bucket.get(k),delete:k=>stores.bucket.delete(k),put(k,...args){if(k.startsWith('final-pdfs/')){attempts++;throw new Error('TEST final storage unavailable');}return stores.bucket.put(k,...args);}}};
 await assert.rejects(signFinal(failing,'guest',session.id,doc.id,input),/TEST final storage unavailable/);
 await stores.db.prepare('UPDATE accounts SET rate_window=?,rate_writes=6 WHERE id=?').bind(Math.floor(Date.now()/60000),'owner').run();
 await assert.rejects(finalizePdf(failing,'owner',session.id,doc.id),e=>e.code==='quota');assert.equal(attempts,1);
 // Simulate the following quota window only in this isolated fixture.
 await stores.db.prepare('UPDATE accounts SET rate_writes=0 WHERE id=?').bind('owner').run();
 const done=await finalizePdf(stores,'guest',session.id,doc.id);assert.ok(done.signedA&&done.signedB&&done.ready);
}));
test('A03: concurrent creation returns one session and only the winning invitation token',()=>fixture(async(stores,r)=>{
 let release,arrived=0;const gate=new Promise(resolve=>{release=resolve;});
 const racing={...stores,db:{prepare(sql){const stmt=stores.db.prepare(sql);if(!sql.startsWith('INSERT INTO shared_sessions'))return stmt;return {bind(...args){const bound=stmt.bind(...args);return {async run(){if(++arrived===2)release();await gate;return bound.run();}};}};}}};
 const both=await Promise.all([createSession(racing,'owner',r.id),createSession(racing,'owner',r.id)]);
 assert.equal(both[0].id,both[1].id);assert.equal(both.filter(s=>s.token).length,1);
 const winner=both.find(s=>s.token);await joinSession(stores,'guest',winner.id,winner.token);
 assert.equal((await readSession(stores,'guest',winner.id)).joined,true);
 assert.equal((await stores.db.prepare('SELECT count(*) AS n FROM shared_sessions').first()).n,1);
}));
