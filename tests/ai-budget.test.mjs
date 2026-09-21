import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';import {createRequire} from 'node:module';
const rootRequire=createRequire(import.meta.url);const wranglerRequire=createRequire(rootRequire.resolve('wrangler/package.json'));const {Miniflare}=wranglerRequire('miniflare');
import {reserveAiCall,AI_DAILY_CALL_LIMIT} from '../server/ai-budget.ts';
test('global AI reservations are atomic across sessions and kinds in real D1',async()=>{
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'ai-budget'},r2Buckets:['BUCKET'],cf:false});
 try{const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')};
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const q of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))await stores.db.prepare(q.trim()).run();
 for(const id of ['A','B'])await stores.db.prepare("INSERT INTO accounts(id,created_at) VALUES (?, 'test')").bind(id).run();
 for(const id of ['session-one','session-two'])await stores.db.prepare("INSERT INTO shared_sessions(id,owner_id,report_id,participant_b,invite_hash,expires_at) VALUES (?,'A',?,'B','',0)").bind(id,id).run();
 for(const id of ['session-one','session-two'])await stores.db.prepare("INSERT INTO reports(owner_id,id,revision,object_key,title,accident_date,updated_at,retention_until) VALUES ('A',?,1,?,'Synthetic','','test',?)").bind(id,'test-'+id,Date.now()+86400000).run();
 await stores.db.prepare("INSERT INTO ai_daily_usage(day,calls,sketches,translations) VALUES ('2000-01-01',100,100,0)").run();
 const results=await Promise.allSettled(Array.from({length:120},(_,i)=>reserveAiCall(stores,i%2?'A':'B',i%2?'session-one':'session-two',i%2?'translation':'sketch')));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,AI_DAILY_CALL_LIMIT);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.code==='ai_daily_limit').length,20);
 const row=await stores.db.prepare('SELECT * FROM ai_daily_usage WHERE day=?').bind(new Date().toISOString().slice(0,10)).first();assert.equal(row.calls,100);assert.equal(row.sketches+row.translations,100);
 await assert.rejects(()=>reserveAiCall(stores,'C','session-one','sketch'));assert.equal((await stores.db.prepare('SELECT calls FROM ai_daily_usage WHERE day=?').bind(row.day).first()).calls,100);
 }finally{await mf.dispose();}
});
