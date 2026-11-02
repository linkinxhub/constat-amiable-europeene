// Isolated, quiescent recovery exercise. Never exports or changes production.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {pdfFixture} from './pdf-fixture.mjs';
import {writeReport,readReport} from '../server/report-service.ts';
import {createSession,joinSession,readSession,updateSession} from '../server/session-service.ts';
import {prepareFinal,signFinal,finalPdf,listFinal} from '../server/final-service.ts';
import {history} from '../server/history-service.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const quote=s=>'"'+s.replaceAll('"','""')+'"';
const hash=async bytes=>Buffer.from(await crypto.subtle.digest('SHA-256',bytes)).toString('hex');
async function isolated(){
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("isolated test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'recovery-exercise'},r2Buckets:['BUCKET'],cf:false});
 const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')};
 for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint'))if(sql.trim())await stores.db.prepare(sql.trim()).run();
 return {mf,stores};
}
async function snapshot(stores){
 const tables=[];
 const names=(await stores.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY CASE name WHEN 'accounts' THEN 0 ELSE 1 END,name").all()).results;
 for(const {name} of names)tables.push({name,rows:(await stores.db.prepare('SELECT * FROM '+quote(name)).all()).results});
 const objects=[];let cursor;
 do{const page=await stores.bucket.list({limit:2,...(cursor?{cursor}:{})});for(const row of page.objects){const object=await stores.bucket.get(row.key);assert.ok(object);const bytes=await object.arrayBuffer();objects.push({key:row.key,data:Buffer.from(bytes).toString('base64'),digest:await hash(bytes),httpMetadata:object.httpMetadata,customMetadata:object.customMetadata});}cursor=page.truncated?page.cursor:undefined;}while(cursor);
 return {tables,objects};
}
async function restore(stores,data){
 for(const object of data.objects){const bytes=Buffer.from(object.data,'base64');assert.equal(await hash(bytes),object.digest,'object integrity before writing');await stores.bucket.put(object.key,bytes,{httpMetadata:object.httpMetadata,customMetadata:object.customMetadata});}
 for(const table of data.tables)for(const row of table.rows){const columns=Object.keys(row);await stores.db.prepare('INSERT OR REPLACE INTO '+quote(table.name)+' ('+columns.map(quote).join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').bind(...columns.map(c=>row[c])).run();}
 assert.equal((await stores.db.prepare('PRAGMA foreign_key_check').all()).results.length,0);
}
test('encrypted isolated D1/R2 snapshot restores A/B permissions, all report versions and the exact signed PDF',async()=>{
 const source=await isolated(),destination=await isolated();
 try{
  const r=pdfFixture();r.vehicles[0].kind='truck-trailer';r.vehicles[0].extra.trailerPlate='TEST-RESTORE-TRAILER';r.vehicles[1].kind='car';r.readingLanguages=['fr','de'];
  await writeReport(source.stores,'TEST_RECOVERY_OWNER',r.id,{report:r,expectedRevision:0});
  const invitation=await createSession(source.stores,'TEST_RECOVERY_OWNER',r.id);await joinSession(source.stores,'TEST_RECOVERY_GUEST',invitation.id,invitation.token);
  for(const actor of ['TEST_RECOVERY_OWNER','TEST_RECOVERY_GUEST']){const s=await readSession(source.stores,actor,invitation.id);await updateSession(source.stores,actor,invitation.id,{report:s.report,expectedRevision:s.revision,finish:true});}
  const current=await readSession(source.stores,'TEST_RECOVERY_OWNER',invitation.id);
  const doc=await prepareFinal(source.stores,'TEST_RECOVERY_OWNER',invitation.id,{style:'keyboard',lang:'de',expectedRevision:current.revision});
  const signature={digest:doc.digest,consent:true,kind:'drawn',data:'data:image/png;base64,'+readFileSync('tests/fixtures/signature-test.png').toString('base64')};
  await signFinal(source.stores,'TEST_RECOVERY_OWNER',invitation.id,doc.id,signature);await signFinal(source.stores,'TEST_RECOVERY_GUEST',invitation.id,doc.id,signature);
  const original=await finalPdf(source.stores,'TEST_RECOVERY_OWNER',invitation.id,doc.id),expected=await readReport(source.stores,'TEST_RECOVERY_OWNER',r.id),versions=await history(source.stores,'TEST_RECOVERY_OWNER',r.id);
  const data=await snapshot(source.stores),key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']),iv=crypto.getRandomValues(new Uint8Array(12));
  const sealed=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(data)));
  const wrongKey=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['decrypt']);await assert.rejects(crypto.subtle.decrypt({name:'AES-GCM',iv},wrongKey,sealed));
  const corrupt=new Uint8Array(sealed.slice(0));corrupt[corrupt.length-1]^=1;await assert.rejects(crypto.subtle.decrypt({name:'AES-GCM',iv},key,corrupt));
  const began=performance.now();await restore(destination.stores,JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,sealed))));
  assert.deepEqual(await readReport(destination.stores,'TEST_RECOVERY_OWNER',r.id),expected);assert.deepEqual(await history(destination.stores,'TEST_RECOVERY_OWNER',r.id),versions);
  const a=await readSession(destination.stores,'TEST_RECOVERY_OWNER',invitation.id),b=await readSession(destination.stores,'TEST_RECOVERY_GUEST',invitation.id);assert.equal(a.side,'A');assert.equal(b.side,'B');assert.ok(a.progress.A.done&&b.progress.B.done);
  const restored=await finalPdf(destination.stores,'TEST_RECOVERY_GUEST',invitation.id,doc.id);assert.equal(restored.signed,true);assert.deepEqual(restored.bytes,original.bytes);assert.equal(await hash(restored.bytes),await hash(original.bytes));assert.equal((await listFinal(destination.stores,'TEST_RECOVERY_OWNER',invitation.id)).length,1);
  await assert.rejects(readSession(destination.stores,'TEST_RECOVERY_STRANGER',invitation.id),e=>e.status===404);await assert.rejects(readReport(destination.stores,'TEST_RECOVERY_GUEST',r.id),e=>e.status===404);await assert.rejects(joinSession(destination.stores,'TEST_RECOVERY_STRANGER',invitation.id,invitation.token),e=>e.status===403);
  const restoredInventory=await snapshot(destination.stores);assert.deepEqual(restoredInventory,data);
  console.log(JSON.stringify({exercise:'isolated_recovery',tables:data.tables.length,objects:data.objects.length,reportVersions:versions.length,pdfBytes:restored.bytes.length,restoreMs:Math.round(performance.now()-began),productionBackup:false,physicalPhones:false}));
 }finally{await source.mf.dispose();await destination.mf.dispose();}
});
