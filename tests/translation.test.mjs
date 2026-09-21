import {confirmedSession} from './confirmed-session.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {PDFDocument,PDFDict,PDFArray,PDFName,PDFRawStream,decodePDFRawStream} from 'pdf-lib';
import {pdfFixture} from './pdf-fixture.mjs';
import {writeReport,readReport} from '../server/report-service.ts';
import {createSession,joinSession,updateSession} from '../server/session-service.ts';
import {prepareFinal,signFinal,finalPdf} from '../server/final-service.ts';
import {consentTranslation,translationState,translateNarratives} from '../server/translation-service.ts';
import {translationSource,translatedReport} from '../features/constat/translation-model.ts';
const env={OPENAI_API_KEY:'synthetic-test-only',OPENAI_SKETCH_MODEL:'synthetic-test-model'};
async function fixture(){const sql=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 let beforePut=()=>{};const objects=new Map();const db={prepare(query){let args=[];return {bind(...a){args=a;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}}}}},async batch(items){sql.exec('BEGIN');try{const out=[];for(const item of items)out.push(await item.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};const bucket={async put(k,v){await beforePut(k);objects.set(k,Buffer.from(v))},async delete(k){objects.delete(k)},async head(k){return objects.has(k)?{size:objects.get(k).length}:null},async get(k){const b=objects.get(k);return b?{size:b.length,json:async()=>JSON.parse(b.toString()),arrayBuffer:async()=>new Uint8Array(b).buffer}:null}};const stores={db,bucket},report=pdfFixture();report.vehicles[0].observations='Je ne roulais pas.';report.vehicles[1].observations='Ich stand still.';report.readingLanguages=['fr','de'];await writeReport(stores,'A',report.id,{report,expectedRevision:0});const session=await createSession(stores,'A',report.id);await joinSession(stores,'B',session.id,session.token);await confirmedSession(stores,session.id);return {sql,stores,report,session,objects,putHook:f=>beforePut=f};}
async function authorize(f){await consentTranslation(f.stores,'A',f.session.id,1,true);await consentTranslation(f.stores,'B',f.session.id,1,true);}
const config={translate:true,style:'keyboard',lang:'de',expectedRevision:1};
const response=t=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(t)}]}]});
function translation(r){return {A_damage:'Markierung an der rechten hinteren Seite.',A_observations:'Ich fuhr nicht.',A_impact:'Hinten rechts',B_damage:'Markierung an der linken vorderen Seite.',B_observations:'Ich stand still.',B_impact:'Vorne links'};}
test('translation permission is participant-specific, revision-scoped and separate from sketch consent',async()=>{
 const f=await fixture();await assert.rejects(()=>consentTranslation(f.stores,'C',f.session.id,1,true),e=>e.status===404);await consentTranslation(f.stores,'A',f.session.id,1,true);const state=await translationState(f.stores,'B',f.session.id,env);assert.equal(state.consentA,1);assert.equal(state.consentB,0);assert.equal(f.sql.prepare('SELECT consent_a FROM shared_sessions').get().consent_a,0);await assert.rejects(()=>prepareFinal(f.stores,'B',f.session.id,config,env),e=>e.code==='translation_consent');await consentTranslation(f.stores,'B',f.session.id,1,true);await updateSession(f.stores,'A',f.session.id,{report:{...f.report,place:'Changed'},expectedRevision:1});await assert.rejects(()=>consentTranslation(f.stores,'B',f.session.id,1,true),e=>e.code==='conflict');await confirmedSession(f.stores,f.session.id);await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,{...config,expectedRevision:2},env),e=>e.code==='translation_consent');
});
test('B prepares a translated PDF: source payload minimized, originals attached, cached and separately signed',async()=>{
 const f=await fixture();await authorize(f);const originalFetch=globalThis.fetch;let calls=0;const translated=translation(f.report);
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');const payload=JSON.parse(options.body);assert.equal(payload.store,false);const input=JSON.parse(payload.input[0].content[0].text);assert.deepEqual(Object.keys(input.declarations).sort(),Object.keys(translationSource(f.report)).sort());assert.ok(['de','fr'].includes(input.targetLanguage));assert.equal(input.declarations.A_observations,'Je ne roulais pas.');assert.equal(payload.input[0].content.length,1);assert.ok(!options.body.includes(f.report.vehicles[0].plate));return response(translated)};
 try{const prepared=await prepareFinal(f.stores,'B',f.session.id,config,env);assert.equal(prepared.translated,true);assert.equal(prepared.lang,'de');assert.equal(prepared.signedA,false);assert.equal(prepared.signedB,false);assert.equal((await prepareFinal(f.stores,'A',f.session.id,config,env)).id,prepared.id);assert.equal(calls,1);
 const pdf=await finalPdf(f.stores,'B',f.session.id,prepared.id),doc=await PDFDocument.load(pdf.bytes);const names=doc.catalog.lookup(PDFName.of('Names'),PDFDict).lookup(PDFName.of('EmbeddedFiles'),PDFDict).lookup(PDFName.of('Names'),PDFArray);let attached;for(let i=0;i<names.size();i+=2){if(names.get(i).decodeText()==='accordia-original-data.json'){const file=names.lookup(i+1,PDFDict);const stream=file.lookup(PDFName.of('EF'),PDFDict).lookup(PDFName.of('F'),PDFRawStream);attached=JSON.parse(new TextDecoder().decode(decodePDFRawStream(stream).decode()));}}
 assert.deepEqual(attached.report,(await readReport(f.stores,'A',f.report.id)).report);assert.deepEqual(attached.translation,translated);assert.equal((await readReport(f.stores,'A',f.report.id)).report.vehicles[0].observations,'Je ne roulais pas.');assert.equal(translatedReport(f.report,translated).vehicles[0].driver,f.report.vehicles[0].driver);
 writeFileSync('/tmp/accordia-translation-preview.pdf',pdf.bytes);
 const signature='data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64');await signFinal(f.stores,'B',f.session.id,prepared.id,{digest:prepared.digest,consent:true,kind:'drawn',data:signature});assert.equal((await finalPdf(f.stores,'A',f.session.id,prepared.id)).signed,false);const signed=await signFinal(f.stores,'A',f.session.id,prepared.id,{digest:prepared.digest,consent:true,kind:'drawn',data:signature});assert.equal(signed.ready,true);f.sql.exec('UPDATE accounts SET rate_writes=0');const another=await prepareFinal(f.stores,'A',f.session.id,{...config,lang:'fr'},env);assert.notEqual(another.digest,prepared.digest);assert.equal(another.signedA,false);assert.equal(another.signedB,false);
 }finally{globalThis.fetch=originalFetch;}
});
test('provider failure, incomplete JSON or missing translated field never produces a PDF',async()=>{
 const f=await fixture();await authorize(f);const originalFetch=globalThis.fetch;try{await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,config,{}),e=>e.code==='ai_unconfigured');for(const answer of [()=>new Response('private upstream error',{status:500}),()=>Response.json({status:'incomplete'}),()=>response({...translation(f.report),A_observations:''}),()=>response({...translation(f.report),unexpected:'field'})]){globalThis.fetch=async()=>answer();await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,config,env),e=>e.code==='translation_failed');assert.equal(f.sql.prepare('SELECT count(*) AS n FROM final_documents').get().n,0);}}finally{globalThis.fetch=originalFetch;}
});
test('revocation while the provider runs, and at storage commit, prevents translated publication',async()=>{
 const f=await fixture();await authorize(f);const originalFetch=globalThis.fetch;try{globalThis.fetch=async()=>{await consentTranslation(f.stores,'B',f.session.id,1,false);return response(translation(f.report));};await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,config,env),e=>e.code==='translation_consent');assert.equal(f.sql.prepare('SELECT count(*) AS n FROM final_documents').get().n,0);await consentTranslation(f.stores,'B',f.session.id,1,true);globalThis.fetch=async()=>response(translation(f.report));f.putHook(k=>{if(k.startsWith('review-pdfs/'))f.sql.exec('UPDATE shared_sessions SET translation_consent_b=0')});await assert.rejects(()=>prepareFinal(f.stores,'B',f.session.id,config,env),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT count(*) AS n FROM final_documents').get().n,0);}finally{globalThis.fetch=originalFetch;}
});
test('translation rate limit blocks provider traffic after six attempts',async()=>{
 const f=await fixture();await authorize(f);f.sql.prepare('UPDATE shared_sessions SET translation_window=?,translation_calls=6').run(Math.floor(Date.now()/3600000));await assert.rejects(()=>translateNarratives(f.stores,'A',f.session.id,1,f.report,'de',env),e=>e.code==='quota');
});

test('final preparation requires explicit valid completion from both sides and checks it again at commit',async()=>{
 const f=await fixture();f.sql.exec('UPDATE shared_sessions SET done_a=NULL,done_b=NULL');
 await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,{...config,translate:false}),e=>e.code==='participants_unfinished');
 const a=await updateSession(f.stores,'A',f.session.id,{report:f.report,expectedRevision:1,finish:true});
 await assert.rejects(()=>prepareFinal(f.stores,'B',f.session.id,{...config,translate:false,expectedRevision:a.revision}),e=>e.code==='participants_unfinished');
 const b=await updateSession(f.stores,'B',f.session.id,{report:a.report,expectedRevision:a.revision,finish:true});
 assert.equal(b.progress.A.done,true);assert.equal(b.progress.B.done,true);
 f.putHook(k=>{if(k.startsWith('review-pdfs/'))f.sql.exec('UPDATE shared_sessions SET done_b=NULL')});
 await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,{...config,translate:false,expectedRevision:b.revision}),e=>e.code==='conflict');
 assert.equal(f.sql.prepare('SELECT count(*) AS n FROM final_documents').get().n,0);
});
test('explicit retranslation calls provider again, preserves previous PDF and requires fresh signatures',async()=>{
 const f=await fixture();await authorize(f);const originalFetch=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return response({...translation(f.report),A_observations:calls===1?'Ich fuhr mit 120 km/h.':'Ich fuhr nicht.'})};
 try{
 const old=await prepareFinal(f.stores,'A',f.session.id,config,env);const bytes=(await finalPdf(f.stores,'A',f.session.id,old.id)).bytes;
 const signature='data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64');
 await signFinal(f.stores,'A',f.session.id,old.id,{digest:old.digest,consent:true,kind:'drawn',data:signature});
 const fresh=await prepareFinal(f.stores,'B',f.session.id,{...config,regenerate:true},env);
 assert.equal(calls,2);assert.notEqual(fresh.id,old.id);assert.notEqual(fresh.digest,old.digest);assert.equal(fresh.signedA,false);assert.equal(fresh.signedB,false);
 assert.deepEqual((await finalPdf(f.stores,'A',f.session.id,old.id)).bytes,bytes);
 assert.equal((await readReport(f.stores,'A',f.report.id)).report.vehicles[0].observations,'Je ne roulais pas.');
 await assert.rejects(()=>prepareFinal(f.stores,'C',f.session.id,{...config,regenerate:true},env),e=>e.status===404);
 await consentTranslation(f.stores,'B',f.session.id,1,false);await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,{...config,regenerate:true},env),e=>e.code==='translation_consent');
 }finally{globalThis.fetch=originalFetch;}
});
test('global daily limit prevents provider calls across translations',async()=>{
 const f=await fixture();await authorize(f);const day=new Date().toISOString().slice(0,10);f.sql.prepare('INSERT INTO ai_daily_usage(day,calls,sketches,translations) VALUES (?,100,70,30)').run(day);
 const originalFetch=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return response(translation(f.report))};
 try{await assert.rejects(()=>prepareFinal(f.stores,'A',f.session.id,config,env),e=>e.code==='ai_daily_limit');assert.equal(calls,0);assert.equal(f.sql.prepare('SELECT calls FROM ai_daily_usage WHERE day=?').get(day).calls,100);assert.equal(f.sql.prepare('SELECT count(*) AS n FROM final_documents').get().n,0);}finally{globalThis.fetch=originalFetch;}
});
