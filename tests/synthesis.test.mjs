import test from 'node:test';import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';import {readFileSync,readdirSync} from 'node:fs';
import {synthesisSchema} from '../features/constat/synthesis-model.ts';
import {synthesisAction,approvedSynthesis,synthesisState} from '../server/synthesis-service.ts';
import {prepareFinal,finalPdf} from '../server/final-service.ts';
import {sketchAction} from '../server/sketch-service.ts';
import {writeReport,readReport} from '../server/report-service.ts';
import {createSession,joinSession,updateSession} from '../server/session-service.ts';
import {purgeExpired} from '../server/retention-service.ts';
import {confirmedSession} from './confirmed-session.mjs';import {pdfFixture} from './pdf-fixture.mjs';
import {synthesisCopy} from '../features/constat/synthesis-copy.ts';
const config={OPENAI_API_KEY:'synthetic-only',OPENAI_SKETCH_MODEL:'synthetic-only'};
const summary={language:'fr',declaredA:['A déclare tourner à droite.'],declaredB:['B déclare que A allait tout droit.'],agreements:[],disagreements:['Les directions déclarées diffèrent.'],missing:['Position du point de choc non précisée.']};
const response=(value=summary)=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});
async function fixture(){
 const sql=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 let hook=()=>{};const objects=new Map();const db={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){hook(q);return {meta:{changes:Number(sql.prepare(q).run(...a).changes)}}}}},async batch(items){sql.exec('BEGIN');try{const r=[];for(const i of items)r.push(await i.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}};
 const bucket={async put(k,v){objects.set(k,Buffer.from(v))},async delete(k){objects.delete(k)},async get(k){const b=objects.get(k);return b?{size:b.length,json:async()=>JSON.parse(b.toString()),arrayBuffer:async()=>new Uint8Array(b).buffer}:null}};
 const stores={db,bucket},report=pdfFixture();await writeReport(stores,'A',report.id,{report,expectedRevision:0});const session=await createSession(stores,'A',report.id);await joinSession(stores,'B',session.id,session.token);sql.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?)').run('B',new Date().toISOString());await confirmedSession(stores,session.id);
 return {sql,stores,report,session,hook:f=>hook=f};
}
async function run(fn){const f=await fixture(),old=globalThis.fetch;let calls=0,body;globalThis.fetch=async(_url,init)=>{calls++;body=JSON.parse(init.body);return response()};const action=(actor,action,key)=>synthesisAction(f.stores,actor,f.session.id,{action,revision:1,key},config);try{await fn({...f,action,calls:()=>calls,body:()=>body})}finally{globalThis.fetch=old;f.sql.close()}}
async function consent(f){await f.action('A','summaryConsent');await f.action('B','summaryConsent');}
async function generate(f){await consent(f);await f.action('A','summaryGenerate');return synthesisState(f.stores,f.session.id)}
test('summary schema is strict, bounded, multilingual and permits honest missing evidence',()=>{
 assert.ok(synthesisSchema.safeParse(summary).success);for(const patch of [{declaredA:['x'.repeat(501)]},{missing:Array(9).fill('x')},{language:'es'},{liability:'A'}])assert.equal(synthesisSchema.safeParse({...summary,...patch}).success,false);
 for(const lang of ['fr','en','de','nl']){assert.ok(synthesisCopy[lang].guide.length>300);assert.equal(synthesisCopy[lang].labels.length,5);assert.ok(synthesisSchema.safeParse({...summary,language:lang}).success)}
});
test('distinct double consent, completed sections, actual permissions and original declarations',()=>run(async f=>{
 await assert.rejects(f.action('stranger','summaryConsent'),e=>e.status===404);
 await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='consent_required');await f.action('A','summaryConsent');await assert.rejects(f.action('B','summaryGenerate'),e=>e.code==='consent_required');assert.equal(f.calls(),0);
 await f.action('B','summaryConsent');f.sql.exec('UPDATE shared_sessions SET done_b=NULL');await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='participants_unfinished');await confirmedSession(f.stores,f.session.id);
 const before=await readReport(f.stores,'A',f.report.id);await f.action('B','summaryGenerate');assert.equal(f.calls(),1);assert.deepEqual(await readReport(f.stores,'A',f.report.id),before);assert.equal(f.body().store,false);assert.equal(f.body().input.includes(f.report.vehicles[0].driver),false);assert.equal(f.body().input.includes('input_image'),false);
 const s=await synthesisState(f.stores,f.session.id);assert.deepEqual(s.content.disagreements,summary.disagreements);await assert.rejects(approvedSynthesis(f.stores,f.session.id,1),e=>e.code==='summary_required');
 await f.action('A','summaryApprove',s.id);assert.equal((await synthesisState(f.stores,f.session.id)).approvedB,false);await f.action('B','summaryApprove',s.id);assert.equal((await approvedSynthesis(f.stores,f.session.id,1)).id,s.id);await f.action('B','summaryReject',s.id);await assert.rejects(approvedSynthesis(f.stores,f.session.id,1),e=>e.code==='summary_required');
}));
test('new sketch cannot bypass summary review; latest proposal and report revisions invalidate approval',()=>run(async f=>{
 for(const actor of ['A','B'])await sketchAction(f.stores,actor,f.session.id,{action:'consent',revision:1},{});
 await assert.rejects(sketchAction(f.stores,'A',f.session.id,{action:'generate',revision:1},config),e=>e.code==='summary_required');assert.equal(f.calls(),0);
 const s=await generate(f);for(const actor of ['A','B'])await f.action(actor,'summaryApprove',s.id);await f.action('A','summaryGenerate');await assert.rejects(f.action('B','summaryApprove',s.id),e=>e.code==='conflict');await assert.rejects(approvedSynthesis(f.stores,f.session.id,1),e=>e.code==='summary_required');assert.equal(f.sql.prepare('SELECT count(*) n FROM synthesis_proposals').get().n,2);
 f.sql.exec('UPDATE accounts SET rate_writes=0');await updateSession(f.stores,'A',f.session.id,{report:{...f.report,place:'Changed'},expectedRevision:1});await assert.rejects(f.action('A','summaryConsent'),e=>e.code==='conflict');await assert.rejects(approvedSynthesis(f.stores,f.session.id,2),e=>e.code==='summary_required');
}));
test('malformed, excessive, incomplete or wrong-language provider output never persists',()=>run(async f=>{
 await consent(f);for(const value of [{...summary,language:'nl'},{...summary,missing:['x'.repeat(501)]},{...summary,extra:'forged'}]){globalThis.fetch=async()=>response(value);await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='ai_unavailable')}
 assert.equal(f.sql.prepare('SELECT count(*) n FROM synthesis_proposals').get().n,0);assert.equal(f.sql.prepare('SELECT ai_lock_until FROM shared_sessions').get().ai_lock_until,0);
}));
test('late generation is fenced by edits, suspension, locks and consent withdrawal',()=>run(async f=>{
 await consent(f);let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);globalThis.fetch=async()=>{started();await gate;return response()};const pending=f.action('A','summaryGenerate');await ready;await assert.rejects(f.action('B','summaryGenerate'),e=>e.code==='conflict');f.sql.exec('UPDATE shared_sessions SET summary_consent_b=0');release();await assert.rejects(pending,e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT count(*) n FROM synthesis_proposals').get().n,0);
 await f.action('B','summaryConsent');globalThis.fetch=async()=>{f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='B'");return response()};await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='conflict');
}));
test('summary approval guards the actor at commit and cannot forge the other side',()=>run(async f=>{
 const s=await generate(f);f.hook(q=>{if(q.startsWith('UPDATE synthesis_proposals SET approved_b'))f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='B'")});await assert.rejects(f.action('B','summaryApprove',s.id),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT approved_a,approved_b FROM synthesis_proposals').get().approved_b,0);
}));
test('hourly and daily quotas block summary provider calls',()=>run(async f=>{
 await consent(f);f.sql.exec('UPDATE shared_sessions SET ai_calls=3,ai_window='+Math.floor(Date.now()/3600000));await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='quota');assert.equal(f.calls(),0);f.sql.exec('UPDATE shared_sessions SET ai_calls=0');f.sql.prepare('INSERT INTO ai_daily_usage(day,calls) VALUES (?,100)').run(new Date().toISOString().slice(0,10));await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='ai_daily_limit');assert.equal(f.calls(),0);
}));
test('retention deletes summary content along with its dossier',()=>run(async f=>{
 await generate(f);f.sql.exec('UPDATE reports SET retention_until=1');await purgeExpired(f.stores);assert.equal(f.sql.prepare('SELECT count(*) n FROM synthesis_proposals').get().n,0);
}));
test('summary history is bounded before another provider call',()=>run(async f=>{
 await consent(f);for(let i=0;i<20;i++)f.sql.prepare('INSERT INTO synthesis_proposals(id,session_id,source_revision,content) VALUES (?,?,1,?)').run(crypto.randomUUID(),f.session.id,JSON.stringify(summary));await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='quota');assert.equal(f.calls(),0);
}));
test('automatic summary needs owner, saved photos and consent; a failed attempt is not repeated after reload',()=>run(async f=>{
 // Configure real stored report as auto mode, then complete the new revision.
 const photo={name:'Synthetic',side:'A',data:'data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64')};
 // Start settings are immutable in a shared session: set fixture setup directly, not a production bypass.
 const version=await f.stores.bucket.get((await f.stores.db.prepare('SELECT object_key FROM reports').first()).object_key);const report=await version.json();report.start={ownerSide:'A',photoOwner:'both',autoSketch:true};report.photos=[photo];const key=(await f.stores.db.prepare('SELECT object_key FROM reports').first()).object_key;await f.stores.bucket.put(key,JSON.stringify(report));await confirmedSession(f.stores,f.session.id);await consent(f);
 await assert.rejects(f.action('B','summaryAuto'),e=>e.code==='forbidden');let attempts=0;globalThis.fetch=async()=>{attempts++;return new Response('',{status:503})};await assert.rejects(f.action('A','summaryAuto'),e=>e.code==='ai_unavailable');await f.action('A','summaryAuto');assert.equal(attempts,1);assert.equal(f.sql.prepare('SELECT auto_summary_revision FROM shared_sessions').get().auto_summary_revision,1);await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='ai_unavailable');assert.equal(attempts,2);
}));

test('reviewed summary binds the sketch and PDF; withdrawal blocks a new PDF at its atomic commit',()=>run(async f=>{
 const s=await generate(f);for(const actor of ['A','B']){await f.action(actor,'summaryApprove',s.id);await sketchAction(f.stores,actor,f.session.id,{action:'consent',revision:1},{})}
 const diagram={roads:[],vehicles:[],uncertainties:['Synthetic only']};globalThis.fetch=async()=>response(diagram);await sketchAction(f.stores,'A',f.session.id,{action:'generate',revision:1},config);const proposed=await f.stores.db.prepare('SELECT * FROM sketch_proposals').first();assert.equal(proposed.summary_id,s.id);for(const actor of ['A','B'])await sketchAction(f.stores,actor,f.session.id,{action:'approve',revision:1,key:proposed.object_key},{});
 const input={style:'keyboard',lang:'fr',expectedRevision:1,sketchSource:'ai'};const pdf=await prepareFinal(f.stores,'A',f.session.id,input);assert.ok(pdf.id);assert.ok((await finalPdf(f.stores,'A',f.session.id,pdf.id)).bytes.length>1000);
 await f.action('B','summaryReject',s.id);await assert.rejects(prepareFinal(f.stores,'A',f.session.id,input),e=>e.code==='sketch_unapproved');await assert.rejects(sketchAction(f.stores,'A',f.session.id,{action:'approve',revision:1,key:proposed.object_key},{}),e=>e.code==='summary_required');assert.ok((await finalPdf(f.stores,'A',f.session.id,pdf.id)).bytes.length>1000);
 await f.action('B','summaryApprove',s.id);f.hook(q=>{if(q.startsWith('INSERT INTO final_documents'))f.sql.exec('UPDATE synthesis_proposals SET approved_b=0')});await assert.rejects(prepareFinal(f.stores,'A',f.session.id,{...input,style:'blue-pen'}),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT count(*) n FROM final_documents').get().n,1);
}));
test('a revised declaration arriving during provider work rejects the late synthesis',()=>run(async f=>{
 await consent(f);globalThis.fetch=async()=>{f.sql.exec('UPDATE reports SET revision=2');return response()};await assert.rejects(f.action('A','summaryGenerate'),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT count(*) n FROM synthesis_proposals').get().n,0);
}));
