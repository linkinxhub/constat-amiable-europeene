// Test-only coordinator. No HTTP endpoint, production identity or provider call.
// Runs the actual report/session/PDF services on isolated Miniflare D1/R2.
import {mkdir,readFile,readdir,writeFile,rename,appendFile} from 'node:fs/promises';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {fresh} from '../../features/constat/model.ts';
import {applyDocumentFields} from '../../features/constat/document-model.ts';
import {writeReport,readReport} from '../../server/report-service.ts';
import {createSession,joinSession,readSession,updateSession,renewInvite} from '../../server/session-service.ts';
import {prepareFinal,signFinal,finalPdf,listFinal} from '../../server/final-service.ts';
import {documentAccess,extractDocument} from '../../server/document-extraction.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const run=resolve(process.argv[2]),output=resolve(process.argv[3]);
await mkdir(join(run,'requests'),{recursive:true});await mkdir(join(run,'responses'),{recursive:true});await mkdir(output,{recursive:true});
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("QA only")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'concrete-dual-agent'},r2Buckets:['BUCKET'],cf:false});
const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')};
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await stores.db.prepare(sql.trim()).run();
const cases={};
for(const mode of ['manual','documents']){
 const actors={A:'TEST_'+mode.toUpperCase()+'_A',B:'TEST_'+mode.toUpperCase()+'_B'};
 const report={...fresh(),id:'TEST_DUAL_'+mode.toUpperCase()+'_20261023',count:'2',readingLanguages:['fr','nl'],start:{ownerSide:'A',photoOwner:'both',autoSketch:false}};
 await writeReport(stores,actors.A,report.id,{report,expectedRevision:0});
 cases[mode]={actors,reportId:report.id,...await createSession(stores,actors.A,report.id)};
}
await writeFile(join(run,'bootstrap.json'),JSON.stringify({testOnly:true,productionAuth:false,providerCalled:false,cases},null,2),{mode:0o600});
console.log('READY: '+run);
let stopping=false;
async function action({actor,operation,input={},mode='manual'}){
 if(!['A','B'].includes(actor)||!cases[mode])throw new Error('invalid_test_actor');
 const c=cases[mode],who=c.actors[actor],side=actor==='A'?0:1;
 if(operation==='info')return {sessionId:c.id,reportId:c.reportId,token:c.token,testOnly:true};
 if(operation==='join')return joinSession(stores,who,c.id,input.token);
 if(operation==='renew')return renewInvite(stores,who,c.id);
 if(operation==='state')return readSession(stores,who,c.id);
 if(operation==='private_report')return readReport(stores,who,c.reportId);
 if(operation==='update'){
  const current=await readSession(stores,who,c.id),report=structuredClone(current.report);
  if(input.common)Object.assign(report,input.common);
  if(input.own)report.vehicles[side]={...report.vehicles[side],...input.own,extra:{...report.vehicles[side].extra,...input.own.extra}};
  if(input.other)report.vehicles[1-side]={...report.vehicles[1-side],...input.other};
  if(input.language)report.readingLanguages[side]=input.language;
  if(input.otherLanguage)report.readingLanguages[1-side]=input.otherLanguage;
  return updateSession(stores,who,c.id,{report,expectedRevision:input.expectedRevision??current.revision,finish:input.finish??false});
 }
 if(operation==='document_access')return documentAccess(stores,who);
 if(operation==='extract'){
  const path=resolve(input.path),data='data:application/pdf;base64,'+(await readFile(path)).toString('base64');
  return extractDocument(stores,who,{kind:input.kind||'vehicle',side:actor,sessionId:c.id,consent:true,data},{});
 }
 if(operation==='review_fields'){
  const current=await readSession(stores,who,c.id),snapshot=current.report.vehicles[side];
  return {testOnly:true,notAnExtraction:true,vehicle:applyDocumentFields(input.current||snapshot,input.snapshot||snapshot,input.fields)};
 }
 if(operation==='prepare'){
  const current=await readSession(stores,who,c.id);
  return prepareFinal(stores,who,c.id,{style:input.style||'keyboard',lang:input.lang||'fr',expectedRevision:input.expectedRevision??current.revision});
 }
 if(operation==='list')return listFinal(stores,who,c.id);
 if(operation==='sign'){
  if(!input.reviewedTestPdf)throw new Error('review_test_pdf_first');
  const data='data:image/png;base64,'+readFileSync('tests/fixtures/signature-test.png').toString('base64');
  return signFinal(stores,who,c.id,input.id,{digest:input.digest,consent:true,kind:'drawn',data});
 }
 if(operation==='download'){
  const result=await finalPdf(stores,who,c.id,input.id),path=join(output,mode+'-'+actor+'-'+input.id+'.pdf');
  await writeFile(path,result.bytes);
  return {path,signed:result.signed,bytes:result.bytes.length,filename:result.filename};
 }
 if(operation==='close'){stopping=true;return {closed:true};}
 throw new Error('unknown_test_operation');
}
try{
 while(!stopping){
  for(const file of (await readdir(join(run,'requests'))).filter(f=>f.endsWith('.json')).sort()){
   const request=JSON.parse(await readFile(join(run,'requests',file),'utf8'));let result;
   try{result={ok:true,result:await action(request)};}
   catch(error){result={ok:false,error:{status:error.status||500,code:error.code||error.message,retryAfterSeconds:error.status===429?61-Math.floor((Date.now()%60000)/1000):undefined}};}
   const at=new Date().toISOString();
   await appendFile(join(output,'events.jsonl'),JSON.stringify({at,actor:request.actor,mode:request.mode||'manual',operation:request.operation,ok:result.ok,error:result.error,revision:result.result?.revision,signed:result.result?.signed,ready:result.result?.ready})+'\n');
   await writeFile(join(run,'responses',file),JSON.stringify({...result,at},null,2),{mode:0o600});
   await rename(join(run,'requests',file),join(run,file+'.done'));
  }
  if(!stopping)await new Promise(resolve=>setTimeout(resolve,100));
 }
}finally{
 for(const [mode,c] of Object.entries(cases)){
  const state=await readSession(stores,c.actors.A,c.id);
  const documents=await listFinal(stores,c.actors.A,c.id);
  await writeFile(join(output,mode+'-state.json'),JSON.stringify({testOnly:true,productionAuth:false,providerCalled:false,...state,documents},null,2));
 }
 await mf.dispose();
}
