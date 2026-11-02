import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
test('compiled AI connection test reaches provider in workerd and never follows redirects with credentials',async()=>{
 let status=200,calls=0;
 const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'ai-connection'},r2Buckets:['BUCKET'],bindings:{AI_SETTINGS_ENCRYPTION_KEY:randomBytes(32).toString('base64')},cf:false,
 outboundService:async req=>{calls++;assert.equal(req.url,'https://api.openai.com/v1/models/synthetic-model');assert.equal(req.headers.get('authorization'),'Bearer sk-synthetic-test-key-never-real');return new Response('{}',{status,headers:status===302?{Location:'https://must-not-follow.invalid/'}:{}})}
 });
 try{
 const db=await mf.getD1Database('DB');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 await db.prepare("INSERT INTO accounts(id,created_at) VALUES ('admin','test')").run();
 await db.prepare("INSERT INTO ai_settings(id,admin_id,updated_at) VALUES ('platform','admin','test')").run();
 const headers={'Content-Type':'application/json',Origin:'http://localhost','X-Accordia-Request':'1','oai-authenticated-user-id':'admin','oai-authenticated-user-email':'test@example.invalid'};
 const request=(method,body)=>mf.dispatchFetch('http://localhost/api/admin/ai-settings',{method,headers,body:JSON.stringify(body)});
 const saved=await request('PUT',{revision:0,model:'synthetic-model',enabled:true,apiKey:'sk-synthetic-test-key-never-real'});assert.equal(saved.status,200);
 const result=await request('POST',{revision:1});assert.equal(result.status,200,JSON.stringify(await result.clone().json()));assert.deepEqual(await result.json(),{ok:true,revision:1});assert.equal(calls,1);
 for(const [nextStatus,error] of [[302,'provider_request'],[401,'provider_key'],[429,'provider_limit']]){
 status=nextStatus;await db.prepare('UPDATE ai_settings SET test_after=0').run();const before=calls;
 const failure=await request('POST',{revision:1});assert.equal((await failure.json()).error,error);assert.equal(calls,before+1);
 }
 }finally{await mf.dispose()}
});
