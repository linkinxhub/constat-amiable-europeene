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
 let beforePut=()=>{};const objects=new Map();const db={prepare(query){let args=[];return {bind(...a){args=a;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}}}}},async batch(items){sql.exec('BEGIN');try{const out=[];for(const item of items)out.push(await item.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};const bucket={async put(k,v){await beforePut(k);objects.set(k,Buffer.from(v))},async delete(k){objects.delete(k)},async head(k){return objects.has(k)?{size:objects.get(k).length}:null},async get(k){const b=objects.get(k);return b?{size:b.length,json:async()=>JSON.parse(b.toString()),arrayBuffer:async()=>new Uint8Array(b).buffer}:null}};const stores={db,bucket},report=pdfFixture();report.vehicles[0].observations='Je ne roulais pas.';report.vehicles[1].observations='Ich stand still.';report.readingLanguages=['fr','de'];await writeReport(stores,'A',report.id,{report,expectedRevision:0});const session=await createSession(stores,'A',report.id);await joinSession(stores,'B',session.id,session.token);return {sql,stores,report,session,objects,putHook:f=>beforePut=f};}
async function authorize(f){await consentTranslation(f.stores,'A',f.session.id,1,true);await consentTranslation(f.stores,'B',f.session.id,1,true);}
const config={translate:true,style:'keyboard',lang:'de',expectedRevision:1};
const response=t=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(t)}]}]});
function translation(r){return {A_damage:'Markierung an der rechten hinteren Seite.',A_observations:'Ich fuhr nicht.',A_impact:'Hinten rechts',B_damage:'Markierung an der linken vorderen Seite.',B_observations:'Ich stand still.',B_impact:'Vorne links'};}

// Audit-only probes: assertions document current limitations, not desired behavior.
const f=await fixture();
const progress=await (await import('../server/session-service.ts')).readSession(f.stores,'B',f.session.id);
const premature=await prepareFinal(f.stores,'B',f.session.id,{style:'keyboard',lang:'fr',expectedRevision:1});
assert.equal(progress.progress.A.done,false);assert.equal(progress.progress.B.done,false);assert.ok(premature.id);
console.log(JSON.stringify({probe:'prepare_before_explicit_completion',doneA:progress.progress.A.done,doneB:progress.progress.B.done,pdfPrepared:!!premature.id}));
await authorize(f);let calls=0;const realFetch=globalThis.fetch;
const altered={...translation(f.report),A_observations:'Ich fuhr mit 120 km/h und war schuld.'};
globalThis.fetch=async()=>{calls++;return response(calls===1?altered:translation(f.report))};
try {
 const bad=await prepareFinal(f.stores,'B',f.session.id,config,env);
 const retry=await prepareFinal(f.stores,'B',f.session.id,config,env);
 assert.equal(bad.translated,true);assert.equal(bad.id,retry.id);assert.equal(calls,1);
 const pdf=await finalPdf(f.stores,'B',f.session.id,bad.id),doc=await PDFDocument.load(pdf.bytes);
 const names=doc.catalog.lookup(PDFName.of('Names'),PDFDict).lookup(PDFName.of('EmbeddedFiles'),PDFDict).lookup(PDFName.of('Names'),PDFArray);
 let attached;for(let i=0;i<names.size();i+=2)if(names.get(i).decodeText()==='accordia-original-data.json'){const stream=names.lookup(i+1,PDFDict).lookup(PDFName.of('EF'),PDFDict).lookup(PDFName.of('F'),PDFRawStream);attached=JSON.parse(new TextDecoder().decode(decodePDFRawStream(stream).decode()));}
 assert.equal(attached.translation.A_observations,altered.A_observations);
 assert.equal(attached.report.vehicles[0].observations,'Je ne roulais pas.');
 console.log(JSON.stringify({probe:'semantically_wrong_translation_and_retry',sourcePreserved:true,alteredMeaningAccepted:true,repeatReturnsSameDocument:bad.id===retry.id,providerCalls:calls}));
} finally {globalThis.fetch=realFetch;}
// Recovery query scaling, entirely in the synthetic SQLite fixture.
f.sql.exec('UPDATE accounts SET rate_writes=0');
for(let i=0;i<1500;i++){const k='synthetic-old-'+i;f.sql.prepare("INSERT INTO storage_objects VALUES (?, 'A', 1, 'committed', 0)").run(k);f.sql.prepare('INSERT INTO report_versions VALUES (?, ?, ?, ?, ?, ?)').run('A','synthetic-archived-report',i+1,k,'synthetic',1);}
const prepare=f.stores.db.prepare.bind(f.stores.db);let queries=0;f.stores.db.prepare=q=>{queries++;return prepare(q)};
await (await import('../server/object-storage.ts')).recoverStorage(f.stores,'A');
console.log(JSON.stringify({probe:'recovery_query_scaling',additionalHistoricalObjects:1500,preparedStatements:queries}));
