import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {randomBytes,createHash} from 'node:crypto';
import {activateAdmin,isSuperAdmin,readAiSettings,saveAiSettings,resolveSketchConfig,testAiConnection} from '../server/ai-settings.ts';
import {readJson,writeGuard} from '../server/http.ts';
function fixture(){
 const sql=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 let hook=()=>{};const db={prepare(query){let args=[];return {bind(...a){args=a;return this},async first(){return sql.prepare(query).get(...args)||null},async run(){hook(query);return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}}}}}};
 const code=randomBytes(32).toString('base64url');const env={AI_SETTINGS_ENCRYPTION_KEY:randomBytes(32).toString('base64'),SUPER_ADMIN_SETUP_HASH:createHash('sha256').update(code).digest('hex'),SUPER_ADMIN_SETUP_EXPIRES:String(Date.now()+60000)};
 return {db,sql,code,env,hook:f=>hook=f};
}
const key='sk-synthetic-test-key-never-a-real-secret';
const data=(revision=0,enabled=true)=>({revision,model:'synthetic-test-model',enabled,apiKey:key});
test('activation requires identity, owner-held code, unexpired setup and a secure key',async()=>{
 const f=fixture();await assert.rejects(()=>activateAdmin(f.db,'',f.code,f.env),e=>e.status===401);await assert.rejects(()=>activateAdmin(f.db,'B','x'.repeat(43),f.env),e=>e.code==='activation_invalid');await assert.rejects(()=>activateAdmin(f.db,'A',f.code,{...f.env,SUPER_ADMIN_SETUP_EXPIRES:'0'}));await assert.rejects(()=>activateAdmin(f.db,'A',f.code,{...f.env,AI_SETTINGS_ENCRYPTION_KEY:''}));assert.equal(await isSuperAdmin(f.db,'A'),false);await activateAdmin(f.db,'A',f.code,f.env);assert.equal(await isSuperAdmin(f.db,'A'),true);assert.equal(await isSuperAdmin(f.db,'B'),false);await assert.rejects(()=>activateAdmin(f.db,'B',f.code,f.env),e=>e.code==='activation_used');assert.equal((await readAiSettings(f.db,'A',f.env)).hasKey,false);
});
test('non-admin users cannot read, save or test settings; arbitrary client role is rejected',async()=>{
 const f=fixture();await activateAdmin(f.db,'A',f.code,f.env);await assert.rejects(()=>readAiSettings(f.db,'B',f.env),e=>e.status===403);await assert.rejects(()=>saveAiSettings(f.db,'B',data(),f.env),e=>e.status===403);await assert.rejects(()=>testAiConnection(f.db,'B',0,f.env),e=>e.status===403);await assert.rejects(()=>saveAiSettings(f.db,'A',{...data(),role:'super_admin'},f.env),e=>e.code==='invalid');
});
test('encrypted settings never return the key and rotation is revision protected',async()=>{
 const f=fixture();await activateAdmin(f.db,'A',f.code,f.env);const saved=await saveAiSettings(f.db,'A',data(),f.env);assert.equal(saved.hasKey,true);assert.equal(saved.revision,1);assert.ok(!JSON.stringify(saved).includes(key));assert.ok(!JSON.stringify(await readAiSettings(f.db,'A',f.env)).includes(key));const raw=f.sql.prepare('SELECT * FROM ai_settings').get();assert.ok(raw.encrypted_key.startsWith('v1.'));assert.ok(!JSON.stringify(raw).includes(key));assert.equal((await resolveSketchConfig(f.db,f.env)).OPENAI_API_KEY,key);assert.equal((await resolveSketchConfig(f.db,f.env,false)).OPENAI_API_KEY,'configured');
 await assert.rejects(()=>saveAiSettings(f.db,'A',data(),f.env),e=>e.code==='conflict');await saveAiSettings(f.db,'A',{revision:1,model:'second-model',enabled:true},f.env);assert.equal((await resolveSketchConfig(f.db,f.env)).OPENAI_API_KEY,key);const replacement=key+'-rotated';await saveAiSettings(f.db,'A',{...data(2),apiKey:replacement},f.env);assert.equal((await resolveSketchConfig(f.db,f.env)).OPENAI_API_KEY,replacement);
});
test('disable preserves key but overrides legacy env; corruption fails closed',async()=>{
 const f=fixture();const legacy={...f.env,OPENAI_API_KEY:'legacy-test',OPENAI_SKETCH_MODEL:'legacy-model'};assert.equal((await resolveSketchConfig(f.db,legacy)).OPENAI_API_KEY,'legacy-test');await activateAdmin(f.db,'A',f.code,f.env);assert.deepEqual(await resolveSketchConfig(f.db,legacy),{});await saveAiSettings(f.db,'A',data(),f.env);await assert.rejects(()=>resolveSketchConfig(f.db,{...f.env,AI_SETTINGS_ENCRYPTION_KEY:randomBytes(32).toString('base64')}),e=>e.code==='ai_configuration');await saveAiSettings(f.db,'A',{revision:1,enabled:false,model:'synthetic-test-model'},f.env);assert.deepEqual(await resolveSketchConfig(f.db,legacy),{});assert.equal((await readAiSettings(f.db,'A',f.env)).hasKey,true);
 await saveAiSettings(f.db,'A',{revision:2,enabled:true,model:'synthetic-test-model'},f.env);f.sql.exec("UPDATE ai_settings SET encrypted_key='v1.invalid.corrupted'");await assert.rejects(()=>resolveSketchConfig(f.db,f.env),e=>e.code==='ai_configuration');
});
test('suspension at SQL commit prevents both activation and settings updates',async()=>{
 const f=fixture();f.sql.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?)').run('A','test');f.hook(q=>{if(q.startsWith('INSERT INTO ai_settings'))f.sql.exec("UPDATE accounts SET status='suspended'")});await assert.rejects(()=>activateAdmin(f.db,'A',f.code,f.env));f.hook(()=>{});f.sql.exec("UPDATE accounts SET status='active'");await activateAdmin(f.db,'A',f.code,f.env);f.hook(q=>{if(q.startsWith('UPDATE ai_settings'))f.sql.exec("UPDATE accounts SET status='suspended'")});await assert.rejects(()=>saveAiSettings(f.db,'A',data(),f.env),e=>e.code==='conflict');assert.equal(f.sql.prepare('SELECT encrypted_key FROM ai_settings').get().encrypted_key,null);await assert.rejects(()=>readAiSettings(f.db,'A',f.env),e=>e.status===403);
});
test('provider test uses fixed URL, no report, safe failures and throttling',async()=>{
 const f=fixture();await activateAdmin(f.db,'A',f.code,f.env);await saveAiSettings(f.db,'A',data(),f.env);const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/models/synthetic-test-model');assert.equal(options.headers.Authorization,'Bearer '+key);assert.equal(options.body,undefined);assert.equal(options.redirect,'error');return Response.json({id:'synthetic-test-model'})};
 try{assert.deepEqual(await testAiConnection(f.db,'A',1,f.env),{ok:true,revision:1});await assert.rejects(()=>testAiConnection(f.db,'A',1,f.env),e=>e.code==='rate_limited');assert.equal(calls,1);for(const [status,code] of [[401,'provider_key'],[404,'provider_model'],[500,'provider_unavailable']]){f.sql.exec('UPDATE ai_settings SET test_after=0');globalThis.fetch=async()=>new Response(key,{status});await assert.rejects(()=>testAiConnection(f.db,'A',1,f.env),e=>e.code===code&&!e.message.includes(key));}}finally{globalThis.fetch=original;}
});
test('admin request body is bounded and same-origin JSON is required',async()=>{
 await assert.rejects(()=>readJson(new Request('https://site.test/api/admin/ai-settings',{method:'PUT',body:JSON.stringify({key:'x'.repeat(5000)})}),4096),e=>e.status===413);
 assert.throws(()=>writeGuard(new Request('https://site.test/api/admin/activate',{method:'POST',headers:{origin:'https://evil.test','x-accordia-request':'1','content-type':'application/json'},body:'{}'})),e=>e.status===403);
});
