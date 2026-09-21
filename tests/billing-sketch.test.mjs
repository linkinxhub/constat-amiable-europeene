import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {fresh} from '../features/constat/model.ts';
import {writeReport} from '../server/report-service.ts';
import {createSession,joinSession} from '../server/session-service.ts';
import {sketchAction,generateTestSketch,sketchState} from '../server/sketch-service.ts';
import {readTestCredits} from '../server/billing-flow.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const config={OPENAI_API_KEY:'synthetic-fixture',OPENAI_SKETCH_MODEL:'synthetic-fixture'};
const sketch={roads:[],vehicles:[],uncertainties:['Synthetic test evidence only']};
const response=()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(sketch)}]}]}));
async function fixture(){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'billing-sketch'},r2Buckets:['BUCKET'],cf:false});
 const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')},db=stores.db;
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 const report={...fresh(),id:'billing_sketch_report_123',count:'2',injured:'no'};
 await writeReport(stores,'A',report.id,{report,expectedRevision:0});
 const session=await createSession(stores,'A',report.id);await joinSession(stores,'B',session.id,session.token);
 for(const actor of ['A','B'])await sketchAction(stores,actor,session.id,{action:'consent',revision:1},{});
 const order=randomUUID();
 await db.prepare("INSERT INTO billing_test_orders(id,owner_id,report_id,locale,created_at) VALUES (?,'A',?,'fr',?)").bind(order,report.id,Date.now()).run();
 await db.prepare("INSERT INTO billing_test_grants(order_id,state,credits,expires_at,created_at) VALUES (?,'granted',10,?,?)").bind(order,Date.now()+3600000,Date.now()).run();
 return {mf,stores,db,report,session,input:()=>({sessionId:session.id,operationId:randomUUID(),revision:1}),balance:()=>readTestCredits(db,'A',report.id)};
}
async function run(fn){const f=await fixture(),old=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return response()};try{await fn(f,()=>calls)}finally{globalThis.fetch=old;await f.mf.dispose()}}
test('test sketch stores its real service result and consumes one credit; retry never calls provider again',()=>run(async(f,calls)=>{
 const input=f.input();assert.deepEqual(await generateTestSketch(f.stores,'A',input,config),{ok:true});
 assert.equal(await f.balance(),9);assert.equal(calls(),1);
 assert.deepEqual((await sketchState(f.stores,'A',f.session.id,config)).proposal.sketch,sketch);
 assert.equal((await f.db.prepare('SELECT state FROM billing_test_uses').first()).state,'succeeded');
 await assert.rejects(generateTestSketch(f.stores,'A',input,config),e=>e.code==='test_operation_already_started');assert.equal(calls(),1);
}));
test('exhaustion, invalid input, another participant and missing consent never reach provider',()=>run(async(f,calls)=>{
 await assert.rejects(generateTestSketch(f.stores,'B',f.input(),config),e=>e.code==='forbidden');
 await assert.rejects(generateTestSketch(f.stores,'A',{...f.input(),reportId:'forged'},config),e=>e.code==='invalid');
 await f.db.prepare('UPDATE shared_sessions SET consent_b=0').run();
 await assert.rejects(generateTestSketch(f.stores,'A',f.input(),config),e=>e.code==='consent_required');assert.equal(await f.balance(),10);
 await f.db.prepare('UPDATE shared_sessions SET consent_b=1').run();
 await f.db.prepare('UPDATE billing_test_grants SET credits=0').run();
 await assert.rejects(generateTestSketch(f.stores,'A',f.input(),config),e=>e.code==='test_credit_unavailable');assert.equal(calls(),0);
}));
test('provider and R2 failures return credit without creating a proposal',()=>run(async(f)=>{
 globalThis.fetch=async()=>new Response('failure',{status:503});
 await assert.rejects(generateTestSketch(f.stores,'A',f.input(),config),e=>e.code==='ai_unavailable');assert.equal(await f.balance(),10);
 globalThis.fetch=async()=>response();
 const bucket=new Proxy(f.stores.bucket,{get(target,key){if(key==='put')return async()=>{throw Error('R2 write failed')};const v=target[key];return typeof v==='function'?v.bind(target):v}});
 await assert.rejects(generateTestSketch({...f.stores,bucket},'A',f.input(),config),/R2 write failed/);
 assert.equal(await f.balance(),10);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM sketch_proposals').first()).n,0);
}));
test('consent withdrawn at output storage blocks commit and restores the credit',()=>run(async(f)=>{
 const bucket=new Proxy(f.stores.bucket,{get(target,key){if(key==='put')return async(...args)=>{await f.db.prepare('UPDATE shared_sessions SET consent_b=0').run();return target.put(...args)};const v=target[key];return typeof v==='function'?v.bind(target):v}});
 await assert.rejects(generateTestSketch({...f.stores,bucket},'A',f.input(),config),e=>e.code==='conflict');
 assert.equal(await f.balance(),10);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM sketch_proposals').first()).n,0);
}));
test('lost response after durable commit never refunds the stored sketch',()=>run(async(f,calls)=>{
 let batches=0;
 const db={prepare:q=>f.db.prepare(q),batch:async statements=>{const result=await f.db.batch(statements);if(++batches===2)throw Error('lost commit response');return result}};
 const input=f.input();await assert.rejects(generateTestSketch({...f.stores,db},'A',input,config));
 assert.equal(await f.balance(),9);assert.equal(calls(),1);
 assert.equal((await f.db.prepare('SELECT state FROM billing_test_uses').first()).state,'succeeded');
 assert.deepEqual((await sketchState(f.stores,'A',f.session.id,config)).proposal.sketch,sketch);
 await assert.rejects(generateTestSketch(f.stores,'A',input,config));assert.equal(calls(),1);
}));
test('lock cleanup failure after success preserves consumed credit and blocks replay',()=>run(async(f,calls)=>{
 const db={batch:s=>f.db.batch(s),prepare:q=>{if(q.startsWith('UPDATE shared_sessions SET ai_lock=NULL'))throw Error('unlock unavailable');return f.db.prepare(q)}};
 const input=f.input();await assert.rejects(generateTestSketch({...f.stores,db},'A',input,config));
 assert.equal(await f.balance(),9);assert.equal((await f.db.prepare('SELECT state FROM billing_test_uses').first()).state,'succeeded');
 await assert.rejects(generateTestSketch(f.stores,'A',input,config));assert.equal(calls(),1);
}));
test('a credit released before commit cannot authorize a stored sketch',()=>run(async(f)=>{
 const bucket=new Proxy(f.stores.bucket,{get(target,key){if(key==='put')return async(...args)=>{await f.db.prepare("UPDATE billing_test_uses SET state='released'").run();return target.put(...args)};const v=target[key];return typeof v==='function'?v.bind(target):v}});
 await assert.rejects(generateTestSketch({...f.stores,bucket},'A',f.input(),config),e=>e.code==='conflict');
 assert.equal(await f.balance(),10);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM sketch_proposals').first()).n,0);
}));
test('failed debit transaction rolls back the proposal and releases the credit',()=>run(async(f)=>{
 await f.db.prepare("CREATE TRIGGER fail_debit BEFORE UPDATE ON billing_test_uses WHEN NEW.state='succeeded' BEGIN SELECT RAISE(ABORT,'synthetic debit failure'); END").run();
 await assert.rejects(generateTestSketch(f.stores,'A',f.input(),config));
 assert.equal(await f.balance(),10);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM sketch_proposals').first()).n,0);
}));
