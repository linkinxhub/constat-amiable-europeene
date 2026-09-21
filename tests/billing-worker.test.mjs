import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createHmac,randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
test('compiled billing routes enforce admin, origin, ownership and signed durable confirmation',async()=>{
 const secret='whsec_syntheticfixture';
 const mf=new Miniflare({modules:[{type:'ESModule',path:resolve('dist/server/index.js')},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:resolve('dist/server',p)}))],modulesRoot:resolve('dist/server'),modulesRules:[{type:'ESModule',include:['**/*.js','**/*.mjs'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'billing-http'},r2Buckets:['BUCKET'],bindings:{BILLING_TEST_ENABLED:'1',STRIPE_TEST_RESTRICTED_KEY:'rk_test_syntheticfixture',STRIPE_TEST_WEBHOOK_SECRET:secret},cf:false});
 try{
 const db=await mf.getD1Database('DB');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 await db.prepare("INSERT INTO accounts(id,created_at) VALUES ('admin','test'),('other','test')").run();
 await db.prepare("INSERT INTO ai_settings(id,admin_id,updated_at) VALUES ('platform','admin','test')").run();
 const headers={'Content-Type':'application/json',Origin:'http://localhost','X-Accordia-Request':'1','oai-authenticated-user-id':'admin','oai-authenticated-user-email':'test@example.invalid'};
 const post=(body,patch={})=>mf.dispatchFetch('http://localhost/api/billing/test/checkout',{method:'POST',headers:{...headers,...patch},body:JSON.stringify(body)});
 assert.equal((await post({}, {'oai-authenticated-user-id':'other'})).status,403);
 assert.equal((await post({}, {Origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await post({amount:1})).status,400);
 assert.equal((await post({reportId:'nonexistent_report_12345',locale:'fr'})).status,404);
 const sketch=(body,patch={})=>mf.dispatchFetch('http://localhost/api/billing/test/sketch',{method:'POST',headers:{...headers,...patch},body:JSON.stringify(body)});
 assert.equal((await sketch({}, {'oai-authenticated-user-id':'other'})).status,403);
 assert.equal((await sketch({}, {Origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await sketch({amount:1})).status,400);
 assert.equal((await sketch({sessionId:'nonexistent_session_123',operationId:randomUUID(),revision:1})).status,404);
 const translation=(body,patch={})=>mf.dispatchFetch('http://localhost/api/billing/test/translation',{method:'POST',headers:{...headers,...patch},body:JSON.stringify(body)});
 assert.equal((await translation({}, {'oai-authenticated-user-id':'other'})).status,403);
 assert.equal((await translation({}, {Origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await translation({amount:1})).status,400);
 assert.equal((await translation({sessionId:'nonexistent_session_123',operationId:randomUUID(),config:{translate:true,style:'keyboard',lang:'fr',expectedRevision:1}})).status,404);
 const order=randomUUID();
 await db.prepare("INSERT INTO reports(owner_id,id,revision,object_key,title,accident_date,updated_at,retention_until) VALUES ('admin','report_http_test_12345',1,'key','test','test','test',?)").bind(Date.now()+3600000).run();
 await db.prepare("INSERT INTO billing_test_orders(id,owner_id,report_id,locale,session_id,created_at) VALUES (?,'admin','report_http_test_12345','fr','cs_test_http',?)").bind(order,Date.now()).run();
 const raw=JSON.stringify({id:'evt_http',livemode:false,type:'checkout.session.completed',data:{object:{id:'cs_test_http',object:'checkout.session',livemode:false,mode:'payment',status:'complete',payment_status:'paid',currency:'eur',amount_total:690,client_reference_id:order,metadata:{accordia_order:order,accordia_sku:'report'}}}});
 const time=Math.floor(Date.now()/1000),signature=`t=${time},v1=${createHmac('sha256',secret).update(`${time}.${raw}`).digest('hex')}`;
 const hook=(body,sig)=>mf.dispatchFetch('http://localhost/api/billing/test/webhook',{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':sig},body});
 assert.equal((await hook(raw,'invalid')).status,400);
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_receipts').first()).n,0);
 for(let i=0;i<2;i++){const result=await hook(raw,signature);assert.equal(result.status,200);assert.deepEqual(await result.json(),{received:true});assert.match(result.headers.get('cache-control'),/no-store/)}
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM billing_test_receipts').first()).n,1);
 assert.equal((await db.prepare('SELECT credits FROM billing_test_grants').first()).credits,10);
 }finally{await mf.dispose()}
});
