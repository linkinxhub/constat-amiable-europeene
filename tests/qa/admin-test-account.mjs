// Local QA only: this creates a database account, not a ChatGPT identity or login.
// Run from the checkout: node --experimental-strip-types tests/qa/admin-test-account.mjs
import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {activateAdmin,isSuperAdmin,readAiSettings} from '../../server/ai-settings.ts';
import {documentAccess,extractDocument} from '../../server/document-extraction.ts';

const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const persistence=await mkdtemp('/tmp/accordia-qa-admin-20261023-');
const admin='TEST_QA_ADMIN_20261023',ordinary='TEST_QA_ORDINARY_20261023';
// No value from the production environment is copied. Secrets exist only in memory.
const code=randomBytes(32).toString('base64url');
const env={
  AI_SETTINGS_ENCRYPTION_KEY:randomBytes(32).toString('base64'),
  SUPER_ADMIN_SETUP_HASH:createHash('sha256').update(code).digest('hex'),
  SUPER_ADMIN_SETUP_EXPIRES:String(Date.now()+60000),
};
let outboundCalls=0;
const mf=new Miniflare({
  modules:true,script:'export default {fetch(){return new Response("Local QA only")}}',
  compatibilityDate:'2026-05-15',cf:false,
  d1Databases:{DB:'isolated-admin-qa'},d1Persist:join(persistence,'d1'),
  outboundService:()=>{outboundCalls++;throw new Error('External network forbidden in admin QA');},
});
const originalFetch=globalThis.fetch;
globalThis.fetch=async()=>{outboundCalls++;throw new Error('Provider forbidden in admin QA');};
try{
  const db=await mf.getD1Database('DB');
  const migrations=(await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort();
  for(const name of migrations){
    for(const sql of (await readFile(join('drizzle',name),'utf8')).split('--> statement-breakpoint')){
      if(sql.trim())await db.prepare(sql.trim()).run();
    }
  }
  const createdAt=new Date().toISOString();
  for(const actor of [admin,ordinary]){
    await db.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?)').bind(actor,createdAt).run();
    assert.equal(await isSuperAdmin(db,actor),false);
  }
  const before=await documentAccess({db},admin);
  assert.deepEqual(before,{available:false,mode:'premium_closed'});
  assert.deepEqual(await activateAdmin(db,admin,code,env),{ok:true});
  assert.equal(await isSuperAdmin(db,admin),true);
  assert.equal(await isSuperAdmin(db,ordinary),false);
  const settings=await readAiSettings(db,admin,env);
  assert.equal(settings.enabled,false);
  assert.equal(settings.hasKey,false);
  assert.equal(settings.model,'');
  assert.equal(settings.secureStorageReady,true);
  const adminAccess=await documentAccess({db},admin);
  const ordinaryAccess=await documentAccess({db},ordinary);
  assert.deepEqual(adminAccess,{available:true,mode:'admin_preview'});
  assert.deepEqual(ordinaryAccess,{available:false,mode:'premium_closed'});
  await assert.rejects(()=>readAiSettings(db,ordinary,env),e=>e.status===403&&e.code==='forbidden');
  await assert.rejects(()=>activateAdmin(db,ordinary,code,env),e=>e.status===409&&e.code==='activation_used');
  const fixture=await readFile('docs/recette-deux-agents-20261023/TEST-FICTIF-documents-A.pdf');
  const extractionInput={kind:'vehicle',side:'A',consent:true,data:'data:application/pdf;base64,'+fixture.toString('base64')};
  await assert.rejects(()=>extractDocument({db},admin,extractionInput,{}),e=>e.status===503&&e.code==='ai_unconfigured');
  await assert.rejects(()=>extractDocument({db},ordinary,extractionInput,{}),e=>e.status===402&&e.code==='premium_closed');
  const account=await db.prepare('SELECT id,status FROM accounts WHERE id=?').bind(admin).first();
  assert.deepEqual(account,{id:admin,status:'active'});
  assert.equal(outboundCalls,0);
  const proof={
    testOnly:true,scope:'isolated local Miniflare D1',productionIdentity:false,
    chatgptAccountCreated:false,productionAccess:false,providerCalled:false,extractionCalled:true,extractionCompleted:false,
    createdAt,account,ordinaryActor:ordinary,persistence,
    actualActivationService:true,migrationsApplied:migrations.length,
    admin:{isSuperAdmin:true,documentAccess:adminAccess,settings},
    ordinary:{isSuperAdmin:false,documentAccess:ordinaryAccess,settingsStatus:403},
    repeatActivation:{status:409,code:'activation_used'},
    extractionWithoutProviderConfiguration:{admin:{status:503,code:'ai_unconfigured'},ordinary:{status:402,code:'premium_closed'},fixture:'TEST-FICTIF-documents-A.pdf',note:'Admin gate passed; file-content validation and real OCR not reached'},
    outboundCalls,secretsWritten:false,
    limits:['No login credentials or ChatGPT identity created','No production changes','No provider configured or invoked','No real document extraction tested'],
  };
  const output=resolve('docs/recette-deux-agents-20261023/admin-test-account-result.json');
  await mkdir(resolve('docs/recette-deux-agents-20261023'),{recursive:true});
  const json=JSON.stringify(proof,null,2)+'\n';
  for(const secret of [code,env.AI_SETTINGS_ENCRYPTION_KEY,env.SUPER_ADMIN_SETUP_HASH])assert.equal(json.includes(secret),false);
  await writeFile(output,json);
  console.log(JSON.stringify({ok:true,localOnly:true,account:admin,providerCalled:false,output,persistence}));
}finally{
  globalThis.fetch=originalFetch;
  await mf.dispose();
}
