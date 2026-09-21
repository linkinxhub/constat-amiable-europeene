import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {pdfFixture} from './pdf-fixture.mjs';
import {confirmedSession} from './confirmed-session.mjs';
import {writeReport} from '../server/report-service.ts';
import {createSession,joinSession} from '../server/session-service.ts';
import {prepareTestTranslation,finalPdf} from '../server/final-service.ts';
import {consentTranslation} from '../server/translation-service.ts';
import {readTestCredits} from '../server/billing-flow.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const config={OPENAI_API_KEY:'synthetic-fixture',OPENAI_SKETCH_MODEL:'synthetic-fixture'};
const sketch={A_damage:'Damage A',A_observations:'Observation A',A_impact:'Rear right',B_damage:'Damage B',B_observations:'Observation B',B_impact:'Front left'};
const response=()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(sketch)}]}]}));
async function fixture(){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'billing-sketch'},r2Buckets:['BUCKET'],cf:false});
 const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')},db=stores.db;
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 const report=pdfFixture();
 await writeReport(stores,'A',report.id,{report,expectedRevision:0});
 const session=await createSession(stores,'A',report.id);await joinSession(stores,'B',session.id,session.token);
 await confirmedSession(stores,session.id);for(const actor of ['A','B'])await consentTranslation(stores,actor,session.id,1,true);
 const order=randomUUID();
 await db.prepare("INSERT INTO billing_test_orders(id,owner_id,report_id,locale,created_at) VALUES (?,'A',?,'fr',?)").bind(order,report.id,Date.now()).run();
 await db.prepare("INSERT INTO billing_test_grants(order_id,state,credits,expires_at,created_at) VALUES (?,'granted',10,?,?)").bind(order,Date.now()+3600000,Date.now()).run();
 return {mf,stores,db,report,session,input:()=>({sessionId:session.id,operationId:randomUUID(),config:{translate:true,style:'keyboard',lang:'en',expectedRevision:1}}),balance:()=>readTestCredits(db,'A',report.id)};
}
async function run(fn){const f=await fixture(),old=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return response()};try{await fn(f,()=>calls)}finally{globalThis.fetch=old;await f.mf.dispose()}}

test('translated PDF consumes once; cached result remains free at zero available credits',()=>run(async(f,calls)=>{
 const first=await prepareTestTranslation(f.stores,'A',f.input(),config);assert.equal(first.translated,true);assert.equal(await f.balance(),9);assert.equal(calls(),1);
 const pdf=await finalPdf(f.stores,'A',f.session.id,first.id);assert.ok(pdf.bytes.length>1000);
 await f.db.prepare('UPDATE billing_test_grants SET credits=1').run();assert.equal(await f.balance(),0);
 const cached=await prepareTestTranslation(f.stores,'A',f.input(),config);assert.equal(cached.id,first.id);assert.equal(calls(),1);
 assert.equal((await f.db.prepare('SELECT count(*) AS n FROM billing_test_uses').first()).n,1);
 const next=f.input();next.config.regenerate=true;await assert.rejects(prepareTestTranslation(f.stores,'A',next,config),e=>e.code==='test_credit_unavailable');assert.equal(calls(),1);
}));
test('explicit regeneration consumes one new credit, retains old PDF and rejects duplicate operation',()=>run(async(f,calls)=>{
 const first=await prepareTestTranslation(f.stores,'A',f.input(),config);
 const next=f.input();next.config.regenerate=true;
 const second=await prepareTestTranslation(f.stores,'A',next,config);assert.notEqual(first.id,second.id);assert.equal(await f.balance(),8);assert.equal(second.signedA,false);assert.equal(second.signedB,false);
 assert.ok((await finalPdf(f.stores,'A',f.session.id,first.id)).bytes.length);
 await assert.rejects(prepareTestTranslation(f.stores,'A',next,config),e=>e.code==='test_operation_already_started');assert.equal(calls(),2);
}));
test('permissions, revision, consent and input are checked before provider or debit',()=>run(async(f,calls)=>{
 await assert.rejects(prepareTestTranslation(f.stores,'B',f.input(),config),e=>e.code==='forbidden');
 const invalid=f.input();invalid.config.translate=false;await assert.rejects(prepareTestTranslation(f.stores,'A',invalid,config),e=>e.code==='invalid');
 const stale=f.input();stale.config.expectedRevision=2;await assert.rejects(prepareTestTranslation(f.stores,'A',stale,config),e=>e.code==='conflict');
 await consentTranslation(f.stores,'B',f.session.id,1,false);await assert.rejects(prepareTestTranslation(f.stores,'A',f.input(),config),e=>e.code==='translation_consent');
 assert.equal(calls(),0);assert.equal(await f.balance(),10);
}));
test('provider error and consent withdrawn during storage leave no PDF and return credit',()=>run(async(f)=>{
 globalThis.fetch=async()=>new Response('failed',{status:503});await assert.rejects(prepareTestTranslation(f.stores,'A',f.input(),config),e=>e.code==='translation_failed');assert.equal(await f.balance(),10);
 globalThis.fetch=async()=>response();
 const bucket=new Proxy(f.stores.bucket,{get(target,key){if(key==='put')return async(...args)=>{await f.db.prepare('UPDATE shared_sessions SET translation_consent_b=0').run();return target.put(...args)};const v=target[key];return typeof v==='function'?v.bind(target):v}});
 await assert.rejects(prepareTestTranslation({...f.stores,bucket},'A',f.input(),config),e=>e.code==='conflict');
 assert.equal(await f.balance(),10);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM final_documents').first()).n,0);
}));
test('lost commit response preserves PDF and debit, then cached recovery is free',()=>run(async(f,calls)=>{
 let batches=0;const db={prepare:q=>f.db.prepare(q),batch:async statements=>{const result=await f.db.batch(statements);if(++batches===2)throw Error('lost commit response');return result}};
 await assert.rejects(prepareTestTranslation({...f.stores,db},'A',f.input(),config));
 assert.equal(await f.balance(),9);assert.equal((await f.db.prepare('SELECT state FROM billing_test_uses').first()).state,'succeeded');
 const recovered=await prepareTestTranslation(f.stores,'A',f.input(),config);assert.ok(recovered.id);assert.equal(calls(),1);assert.equal(await f.balance(),9);
}));
test('debit SQL failure rolls back PDF reference and releases credit',()=>run(async(f)=>{
 await f.db.prepare("CREATE TRIGGER fail_debit BEFORE UPDATE ON billing_test_uses WHEN NEW.state='succeeded' BEGIN SELECT RAISE(ABORT,'synthetic debit failure'); END").run();
 await assert.rejects(prepareTestTranslation(f.stores,'A',f.input(),config));
 assert.equal(await f.balance(),10);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM final_documents').first()).n,0);
}));
