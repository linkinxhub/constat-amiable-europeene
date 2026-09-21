import {reportSize} from '../features/constat/report-size.ts';
import {confirmedSession} from './confirmed-session.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';import {readFileSync,readdirSync} from 'node:fs';
import {revisionGate} from '../features/constat/revision-gate.ts';
import {reportContentKey,deviceCompletionKey} from '../features/constat/same-device-model.ts';
import {finalMissingFields} from '../features/constat/completeness.ts';
import {finalReady,prepareFinal} from '../server/final-service.ts';
import {pdfFixture} from './pdf-fixture.mjs';
import {writeReport,readReport} from '../server/report-service.ts';
import {readSession,readSessionChanges,createSession,joinSession,updateSession} from '../server/session-service.ts';
import {sketchAction} from '../server/sketch-service.ts';
import {recoverStorage} from '../server/object-storage.ts';
import {validatePhotos,validateSignature} from '../server/photo-validation.ts';
const png=readFileSync(new URL('./fixtures/signature-test.png',import.meta.url));
const data='data:image/png;base64,'+png.toString('base64');
function fixture(){
 const sql=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 let beforePut=()=>{},beforeQuery=()=>{},failDelete=false;const objects=new Map();
 const db={prepare(query){let args=[];return {bind(...a){args=a;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){beforeQuery(query);return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}}}}},async batch(items){sql.exec('BEGIN');try{const result=[];for(const x of items)result.push(await x.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}};
 const bucket={async put(k,v){await beforePut(k);objects.set(k,Buffer.from(v))},async delete(k){if(failDelete)throw new Error('delete unavailable');objects.delete(k)},async head(k){return objects.has(k)?{size:objects.get(k).length}:null},async get(k){const b=objects.get(k);return b?{size:b.length,json:async()=>JSON.parse(b.toString()),arrayBuffer:async()=>new Uint8Array(b).buffer}:null}};
 return {stores:{db,bucket},sql,objects,putHook:f=>beforePut=f,queryHook:f=>beforeQuery=f,failDelete:v=>failDelete=v,reset:()=>sql.exec('UPDATE accounts SET rate_writes=0')};
}
async function shared(){const f=fixture(),r=pdfFixture();await writeReport(f.stores,'A',r.id,{report:r,expectedRevision:0});const s=await createSession(f.stores,'A',r.id);await joinSession(f.stores,'B',s.id,s.token);f.sql.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?)').run('B',new Date().toISOString());await confirmedSession(f.stores,s.id);return {...f,r,s};}
const used=f=>f.sql.prepare("SELECT budget_bytes FROM accounts WHERE id='A'").get().budget_bytes;
const actual=f=>[...f.objects.values()].reduce((n,b)=>n+b.length,0);
test('a late poll cannot undo a write, a newer read or a session change',()=>{
 const gate=revisionGate(),old=gate.read();assert.ok(gate.accept(old,3));const write=gate.beginWrite();assert.equal(gate.accept(old,3),false);assert.ok(gate.commit(write,4));gate.endWrite(write);assert.equal(gate.accept(old,3),false);assert.equal(gate.accept(old,4),false);assert.equal(gate.accept(gate.read(),3),false);assert.ok(gate.accept(gate.read(),5));gate.reset();assert.equal(gate.accept(old,5),false);assert.ok(gate.accept(gate.read(),1));
});
test('completion fingerprints preserve metadata saves and separate report identities',()=>{
 const r=pdfFixture();r.photos=[{name:'proof',data,side:'A'}];const before=reportContentKey(r),a=deviceCompletionKey(r,0),b=deviceCompletionKey(r,1);r.updated=new Date().toISOString();assert.equal(reportContentKey(r),before);r.id='another_report_12345678';assert.notEqual(reportContentKey(r),before);r.photos[0].name='corrected name';assert.notEqual(deviceCompletionKey(r,0),a);assert.equal(deviceCompletionKey(r,1),b);
});
test('final diagnostics identify third-party answers and the correct unconfirmed driver',()=>{
 const r=pdfFixture();delete r.otherObjectsDamage;r.vehicles[1].standardConfirmed=false;const missing=finalMissingFields(r);assert.ok(missing.some(f=>f.field==='thirdObjects'&&f.step===0));assert.ok(missing.some(f=>f.field==='confirmStandard'&&f.vehicle===1));assert.equal(finalReady(r),false);r.otherObjectsDamage='no';r.vehicles[1].standardConfirmed=true;assert.deepEqual(finalMissingFields(r),[]);assert.ok(finalReady(r));
});
test('animated PNG chunks are rejected for both photos and signatures',async()=>{
 await validateSignature(data);for(const tag of ['acTL','fcTL','fdAT']){const chunk=Buffer.alloc(12);chunk.write(tag,4);const animated='data:image/png;base64,'+Buffer.concat([png.subarray(0,33),chunk,png.subarray(33)]).toString('base64');await assert.rejects(()=>validateSignature(animated));await assert.rejects(()=>validatePhotos([{name:'animation',data:animated}]));}
});
test('invalid images, upload failures and failed commits retain attempt rate but refund bytes',async()=>{
 const f=fixture(),r=pdfFixture();await assert.rejects(()=>writeReport(f.stores,'A',r.id,{report:{...r,photos:[{name:'bad',data:'data:image/png;base64,AAAA'}]},expectedRevision:0}));assert.equal(used(f),0);assert.equal(f.sql.prepare('SELECT rate_writes FROM accounts').get().rate_writes,1);
 await writeReport(f.stores,'A',r.id,{report:r,expectedRevision:0});const old=used(f);f.putHook(()=>{throw new Error('upload failed')});await assert.rejects(()=>writeReport(f.stores,'A',r.id,{report:r,expectedRevision:1}));assert.equal(used(f),old);assert.equal(used(f),actual(f));
 f.putHook(()=>f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='A'"));await assert.rejects(()=>writeReport(f.stores,'A',r.id,{report:r,expectedRevision:1}),e=>e.code==='conflict');assert.equal(used(f),old);assert.equal(actual(f),old);assert.equal(f.sql.prepare('SELECT revision FROM reports').get().revision,1);
});
test('explicit recovery reclaims failed deletions and legacy overcharge without deleting versions',async()=>{
 const f=fixture(),r=pdfFixture();await writeReport(f.stores,'A',r.id,{report:r,expectedRevision:0});await writeReport(f.stores,'A',r.id,{report:r,expectedRevision:1});const valid=[...f.objects.keys()];f.failDelete(true);f.putHook(()=>f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='A'"));await assert.rejects(()=>writeReport(f.stores,'A',r.id,{report:r,expectedRevision:2}));assert.equal(f.objects.size,3);f.failDelete(false);f.sql.exec("UPDATE accounts SET status='active',rate_writes=0,budget_bytes=134217728;UPDATE storage_objects SET expires_at=0;");await recoverStorage(f.stores,'A');assert.deepEqual([...f.objects.keys()],valid);assert.equal(used(f),actual(f));assert.equal(f.sql.prepare('SELECT count(*) AS n FROM report_versions').get().n,2);
 // Legacy valid objects are indexed before the budget is recalculated.
 f.sql.exec('DELETE FROM storage_objects;UPDATE accounts SET rate_writes=0,budget_bytes=134217728');await recoverStorage(f.stores,'A');assert.equal(used(f),actual(f));assert.equal((await readReport(f.stores,'A',r.id)).revision,2);
});
test('recovery of an expired reservation fences a delayed upload and removes its late object',async()=>{
 const f=fixture(),r=pdfFixture();await writeReport(f.stores,'A',r.id,{report:r,expectedRevision:0});let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);f.putHook(async()=>{started();await gate});const pending=writeReport(f.stores,'A',r.id,{report:r,expectedRevision:1});await ready;f.sql.exec("UPDATE storage_objects SET expires_at=0 WHERE state='pending'");await recoverStorage(f.stores,'A');release();await assert.rejects(()=>pending,e=>e.code==='conflict');assert.equal(f.objects.size,1);assert.equal(used(f),actual(f));assert.equal((await readReport(f.stores,'A',r.id)).revision,1);
});
test('AI generation is serialized and cannot commit after a revision change or suspension',async()=>{
 const f=await shared();await sketchAction(f.stores,'A',f.s.id,{action:'consent',revision:1},{});await sketchAction(f.stores,'B',f.s.id,{action:'consent',revision:1},{});
 const original=globalThis.fetch;let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);globalThis.fetch=async()=>{started();await gate;return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({roads:[],vehicles:[],uncertainties:['Synthetic test']})}]}]})};
 const cfg={OPENAI_API_KEY:'test-only',OPENAI_SKETCH_MODEL:'test-only'};
 try{const generation=sketchAction(f.stores,'A',f.s.id,{action:'generate',revision:1},cfg);await ready;await assert.rejects(()=>sketchAction(f.stores,'B',f.s.id,{action:'generate',revision:1},cfg),e=>e.code==='conflict');await updateSession(f.stores,'A',f.s.id,{report:{...f.r,place:'New place'},expectedRevision:1});release();await assert.rejects(()=>generation,e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT count(*) AS n FROM sketch_proposals').get().n,0);assert.equal(f.sql.prepare('SELECT ai_lock_until FROM shared_sessions').get().ai_lock_until,0);assert.equal(used(f),actual(f));
 f.reset();await sketchAction(f.stores,'A',f.s.id,{action:'consent',revision:2},{});await sketchAction(f.stores,'B',f.s.id,{action:'consent',revision:2},{});f.putHook(k=>{if(k.startsWith('sketches/'))f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='B'")});await assert.rejects(()=>sketchAction(f.stores,'B',f.s.id,{action:'generate',revision:2},cfg),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT count(*) AS n FROM sketch_proposals').get().n,0);
 }finally{globalThis.fetch=original;release();}
});
test('consent and approval verify participant status at the SQL commit',async()=>{
 const f=await shared();f.queryHook(query=>{if(query.startsWith('UPDATE shared_sessions SET consent_b'))f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='B'")});await assert.rejects(()=>sketchAction(f.stores,'B',f.s.id,{action:'consent',revision:1},{}),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT consent_b FROM shared_sessions').get().consent_b,0);f.sql.exec("UPDATE accounts SET status='active' WHERE id='B'");f.sql.prepare('INSERT INTO sketch_proposals(session_id,source_revision,object_key) VALUES (?,?,?)').run(f.s.id,1,'synthetic-proposal');f.queryHook(query=>{if(query.startsWith('UPDATE sketch_proposals SET approved_b'))f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='B'")});await assert.rejects(()=>sketchAction(f.stores,'B',f.s.id,{action:'approve',revision:1,key:'synthetic-proposal'},{}),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT approved_b FROM sketch_proposals').get().approved_b,0);
});
test('selecting AI for the PDF requires a current proposal approved by both',async()=>{
 const f=await shared();await assert.rejects(()=>prepareFinal(f.stores,'A',f.s.id,{style:'keyboard',lang:'fr',expectedRevision:1,sketchSource:'ai'}),e=>e.code==='sketch_unapproved');const manual=await prepareFinal(f.stores,'A',f.s.id,{style:'keyboard',lang:'fr',expectedRevision:1,sketchSource:'manual'});assert.ok(manual.id);
});

test('an unrelated WebP preview is not displayed as photographic evidence in the PDF',async()=>{
 const {renderPdf}=await import('../server/pdf-renderer.ts');const {PDFDocument,PDFDict,PDFName}=await import('pdf-lib');const r=pdfFixture();r.photos=[{name:'Synthetic red image.webp',data:'data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoCAAIAAUAmJaACdLoB+AADsAD+8ut//NgVzXPv9//S4P0uD9Lg/9KQAAA=',preview:data}];await validatePhotos(r.photos);const pdf=await PDFDocument.load(await renderPdf({report:r,style:'keyboard',lang:'fr',revision:1,digest:'test',createdAt:'2026-09-21T09:00:00Z',sketch:null}));assert.equal(pdf.getPages().at(-1).node.Resources().lookupMaybe(PDFName.of('XObject'),PDFDict)?.keys().length||0,0);assert.ok(pdf.catalog.get(PDFName.of('Names')));
});

test('unchanged session polling reads no photos and still checks access and completion stamps',async()=>{
 const f=await shared();const initial=await readSession(f.stores,'A',f.s.id);let reads=0;const get=f.stores.bucket.get;f.stores.bucket.get=async k=>{reads++;return get(k)};
 const unchanged=await readSessionChanges(f.stores,'B',f.s.id,initial.syncToken);assert.equal(unchanged.unchanged,true);assert.equal(reads,0);assert.equal('report' in unchanged,false);
 await assert.rejects(()=>readSessionChanges(f.stores,'C',f.s.id,initial.syncToken),e=>e.status===404);
 f.sql.exec('UPDATE shared_sessions SET done_b=NULL');const changed=await readSessionChanges(f.stores,'A',f.s.id,initial.syncToken);assert.equal(changed.progress.B.done,false);assert.equal(reads,1);assert.notEqual(changed.syncToken,initial.syncToken);
 f.sql.exec("UPDATE accounts SET status='suspended' WHERE id='A'");await assert.rejects(()=>readSessionChanges(f.stores,'B',f.s.id,changed.syncToken),e=>e.status===403);
});
test('report byte display remains exact for unicode and replaced photo arrays',()=>{
 const r=pdfFixture();r.photos=[{name:'é🚚',data:'data:image/png;base64,AAAA',side:'A'}];
 for(const report of [r,{...r,place:'Liège 🚙'},{...r,photos:[]}])assert.equal(reportSize(report),new TextEncoder().encode(JSON.stringify(report)).length);
});
test('storage recovery processes bounded missing batches, retains versions and does not lower budget early',async()=>{
 const f=await shared();for(let i=0;i<60;i++){const key='historical-'+i;f.objects.set(key,Buffer.from('kept'));f.sql.prepare('INSERT INTO report_versions(owner_id,report_id,revision,object_key,created_at,size_bytes) VALUES (?,?,?,?,?,?)').run('A',f.r.id,100+i,key,'2026-09-21',4);}
 f.sql.exec('UPDATE accounts SET budget_bytes=134217728');let heads=0;const head=f.stores.bucket.head;f.stores.bucket.head=async k=>{heads++;return head(k)};
 const first=await recoverStorage(f.stores,'A');assert.equal(first.more,true);assert.equal(heads,25);assert.equal(used(f),134217728);
 const second=await recoverStorage(f.stores,'A');assert.equal(second.more,true);assert.equal(heads,50);
 const third=await recoverStorage(f.stores,'A');assert.equal(third.more,false);assert.equal(heads,60);assert.equal(used(f),actual(f));assert.equal(f.sql.prepare('SELECT count(*) AS n FROM report_versions').get().n,61);
 let statements=0;const prepare=f.stores.db.prepare;f.stores.db.prepare=q=>{statements++;return prepare(q)};await recoverStorage(f.stores,'A');assert.ok(statements<15);assert.equal(heads,60);
});
test('cleanup handles ten expired operations per batch and preserves another owner',async()=>{
 const f=await shared();for(let i=0;i<12;i++){const k='pending-'+i;f.objects.set(k,Buffer.from('x'));f.sql.prepare("INSERT INTO storage_objects VALUES (?, 'A',1,'pending',0)").run(k);}
 f.objects.set('other-owner',Buffer.from('x'));f.sql.exec("INSERT INTO storage_objects VALUES ('other-owner','OTHER',1,'pending',0)");
 const first=await recoverStorage(f.stores,'A');assert.equal(first.more,true);assert.equal(first.processed,10);
 const second=await recoverStorage(f.stores,'A');assert.equal(second.more,false);assert.equal(second.processed,2);assert.ok(f.objects.has('other-owner'));assert.equal(f.sql.prepare("SELECT count(*) AS n FROM report_versions WHERE owner_id='A'").get().n,1);
});
test('global limit also prevents sketch provider calls and releases its session lock',async()=>{
 const f=await shared();await sketchAction(f.stores,'A',f.s.id,{action:'consent',revision:1},{});await sketchAction(f.stores,'B',f.s.id,{action:'consent',revision:1},{});
 f.sql.prepare('INSERT INTO ai_daily_usage(day,calls,sketches,translations) VALUES (?,100,40,60)').run(new Date().toISOString().slice(0,10));const oldFetch=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('must not call')};
 try{await assert.rejects(()=>sketchAction(f.stores,'A',f.s.id,{action:'generate',revision:1},{OPENAI_API_KEY:'synthetic-test',OPENAI_SKETCH_MODEL:'synthetic-test'}),e=>e.code==='ai_daily_limit');assert.equal(calls,0);assert.equal(f.sql.prepare('SELECT ai_lock_until FROM shared_sessions').get().ai_lock_until,0);}finally{globalThis.fetch=oldFetch;}
});
