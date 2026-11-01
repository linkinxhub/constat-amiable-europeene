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
import {saveAiSettings} from '../server/ai-settings.ts';
test('compiled document extraction enforces paid gate and uses encrypted provider settings',async()=>{
 let calls=0;
 const env={AI_SETTINGS_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64')};
 const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'documents-worker'},r2Buckets:['BUCKET'],bindings:env,cf:false,outboundService:async req=>{
 calls++;assert.equal(req.url,'https://api.openai.com/v1/responses');const payload=await req.json();assert.equal(payload.store,false);assert.equal(payload.input[0].content[1].type,'input_file');
 return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({fields:[{field:'plate',value:'TEST-123',confidence:'high'}]})}]}]});
 }});
 try{const db=await mf.getD1Database('DB');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 await db.prepare("INSERT INTO ai_settings(id,admin_id,revision,model,enabled,updated_at,test_after) VALUES ('platform','A',0,'',0,'test',0)").run();
 await saveAiSettings(db,'A',{revision:0,enabled:true,model:'synthetic',apiKey:'sk-synthetic-test-key-never-a-real-secret'},env);
 const body={kind:'vehicle',side:'A',consent:true,data:'data:application/pdf;base64,'+Buffer.from('%PDF-1.7\n%%EOF').toString('base64')};
 const request=(actor,data=body,origin='http://localhost')=>mf.dispatchFetch('http://localhost/api/document-extraction',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'X-Accordia-Request':'1','oai-authenticated-user-id':actor,'oai-authenticated-user-email':'synthetic@example.invalid'},body:JSON.stringify(data)});
 assert.equal((await request('B')).status,402);assert.equal((await request('A',{...body,consent:false})).status,400);assert.equal((await request('A',body,'https://foreign.invalid')).status,403);assert.equal(calls,0);
 const result=await request('A');assert.equal(result.status,200,await result.clone().text());assert.equal((await result.json()).fields[0].value,'TEST-123');assert.equal(calls,1);
 assert.equal((await db.prepare('SELECT count(*) n FROM reports').first()).n,0);
 }finally{await mf.dispose()}
});
