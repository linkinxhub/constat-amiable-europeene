import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {pdfFixture} from './pdf-fixture.mjs';
import {writeReport} from '../server/report-service.ts';
import {createSession,joinSession} from '../server/session-service.ts';
import {confirmedSession} from './confirmed-session.mjs';
import {consentTranslation} from '../server/translation-service.ts';
import {translationSource} from '../features/constat/translation-model.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
test('compiled translation uses workerd-compatible fetch and refuses redirects without leaking credentials',async()=>{
 let status=200,calls=0;const report=pdfFixture();
 const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'translation-worker'},r2Buckets:['BUCKET'],bindings:{OPENAI_API_KEY:'synthetic-only',OPENAI_SKETCH_MODEL:'synthetic'},cf:false,outboundService:async req=>{calls++;assert.equal(req.url,'https://api.openai.com/v1/responses');assert.equal(req.headers.get('authorization'),'Bearer synthetic-only');return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(translationSource(report))}]}]}),{status,headers:status===302?{Location:'https://must-not-follow.invalid/'}:{}})}});
 try{const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')};for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await stores.db.prepare(sql.trim()).run();await writeReport(stores,'A',report.id,{report,expectedRevision:0});const s=await createSession(stores,'A',report.id);await joinSession(stores,'B',s.id,s.token);await confirmedSession(stores,s.id);for(const actor of ['A','B'])await consentTranslation(stores,actor,s.id,1,true);
 const headers={'Content-Type':'application/json',Origin:'http://localhost','X-Accordia-Request':'1','oai-authenticated-user-id':'B','oai-authenticated-user-email':'synthetic@example.invalid'};
 const request=regenerate=>mf.dispatchFetch('http://localhost/api/sessions/'+s.id+'/final',{method:'POST',headers,body:JSON.stringify({style:'keyboard',lang:'de',expectedRevision:1,translate:true,regenerate})});
 const success=await request(false);assert.equal(success.status,200,JSON.stringify(await success.clone().json()));assert.equal((await success.json()).translated,true);assert.equal(calls,1);
 status=302;const redirect=await request(true);assert.equal(redirect.status,503);assert.equal((await redirect.json()).error,'translation_failed');assert.equal(calls,2);
 }finally{await mf.dispose()}
});
