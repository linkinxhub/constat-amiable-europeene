import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
import {z} from 'zod';
import {componentHarness} from './lifecycle-harness.mjs';
import {prepareDraftSignIn} from '../features/constat/signin-draft.ts';
import {saveChoiceCopy} from '../features/constat/save-choice-copy.ts';
function loadTs(path){const exports={};new Function('require','exports',ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(id=>loadTs(new URL(id+(id.endsWith('.ts')?'':'.ts'),new URL(path,'file://'+process.cwd()+'/')).pathname),exports);return exports;}
const {cloudCopy}=loadTs('features/constat/cloud-copy.ts');
import {pdfFixture} from './pdf-fixture.mjs';
const modules={'./network-notice':{NetworkNotice:'NetworkNotice'},'./share-link-actions':{ShareLinkActions:'ShareLinkActions'},zod:{z}},file=ts.createSourceFile('c.tsx',readFileSync('features/constat/cloud-panel.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
for(const n of file.statements)if(ts.isImportDeclaration(n)&&!['react','zod'].includes(n.moduleSpecifier.text)){const key=n.moduleSpecifier.text,bindings=n.importClause?.namedBindings,exports={};if(bindings&&ts.isNamedImports(bindings))for(const el of bindings.elements)if(!el.isTypeOnly)exports[el.propertyName?.text||el.name.text]=el.name.text;modules[key]=exports;if(key.startsWith('./')&&key!=='./model'&&existsSync('features/constat/'+key.slice(2)+'.ts'))Object.assign(exports,loadTs('features/constat/'+key.slice(2)+'.ts'));}
// model.ts imports use extensionless production paths; the fixture is validated by existing model tests.
modules['./model']={schema:z.any()};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const props=()=>({lang:'fr',account:null,signInUrl:'/signin',report:pdfFixture(),context:null,onSaved(){},onOpen(){},onBusy(){},disabled:false,hasUnsaved:true,compact:true,localSaved:true});
function text(h){return h.nodes(n=>typeof n.props?.children==='string').map(n=>n.props.children).join(' ')}
test('login preparation refuses failed saves and invalid or inaccessible resume pointers',async()=>{
 let reads=0;const storage={getItem(){reads++;return '{"id":"draft"}'}};
 assert.equal(await prepareDraftSignIn(async()=>false,storage,'draft'),false);assert.equal(reads,0);
 assert.equal(await prepareDraftSignIn(async()=>{throw Error('quota')},storage,'draft'),false);
 for(const value of [null,'bad','{}','{"id":"other"}'])assert.equal(await prepareDraftSignIn(async()=>true,{getItem:()=>value},'draft'),false);
 assert.equal(await prepareDraftSignIn(async()=>true,{getItem(){throw Error('blocked')}},'draft'),false);
 let pointer=null;assert.equal(await prepareDraftSignIn(async()=>{pointer='{"id":"draft"}';return true},{getItem:()=>pointer},'draft'),true);
});
test('actual guest save choice waits for a verified local save before login, in four languages',async()=>{
 const old=globalThis.window;let destination='';globalThis.window={location:{assign:v=>destination=v}};
 try{for(const lang of ['fr','en','de','nl']){destination='';let release;const pending=new Promise(r=>release=r),h=componentHarness('features/constat/cloud-panel.tsx','CloudPanel',modules),p={...props(),lang,onBeforeSignIn:()=>pending};h.render(p);assert.match(text(h),new RegExp(saveChoiceCopy[lang].localSaved.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));h.nodes(n=>n.type==='Button')[0].props.onClick();await settle();assert.equal(destination,'');release(false);await settle();h.render(p);assert.equal(destination,'');assert.ok(text(h).includes(cloudCopy[lang].unavailable));p.onBeforeSignIn=async()=>true;h.render(p);h.nodes(n=>n.type==='Button')[0].props.onClick();await settle();assert.equal(destination,'/signin');h.unmount();}}
 finally{globalThis.window=old}
});
test('actual account action saves explicitly and never shows success after conflict or newer edits',async()=>{
 const old=globalThis.fetch;let requests=0,saved=0,release;
 globalThis.fetch=async()=>{requests++;return new Promise(r=>release=r)};
 try{const h=componentHarness('features/constat/cloud-panel.tsx','CloudPanel',modules),p={...props(),account:{displayName:'Test'},onSaved(){saved++}};h.render(p);assert.equal(requests,0);h.nodes(n=>n.type==='Button')[0].props.onClick();await settle();assert.equal(requests,1);release({ok:false,json:async()=>({error:'conflict'})});await settle();h.render(p);assert.equal(saved,0);assert.ok(!text(h).includes(saveChoiceCopy.fr.cloudSaved));h.nodes(n=>n.type==='Button')[0].props.onClick();await settle();release({ok:true,json:async()=>({report:p.report,revision:1})});await settle();h.render(p);assert.equal(saved,1);assert.ok(!text(h).includes(cloudCopy.fr.saved));p.context={id:p.report.id,revision:1};p.hasUnsaved=false;h.render(p);assert.ok(text(h).includes(saveChoiceCopy.fr.cloudSaved));p.hasUnsaved=true;h.render(p);assert.ok(!text(h).includes(saveChoiceCopy.fr.cloudSaved));assert.ok(!text(h).includes(cloudCopy.fr.saved));h.unmount();}
 finally{globalThis.fetch=old}
});

test('creating an invitation keeps the owner on the form and exposes QR, copy and explicit session link in four languages',async()=>{
 const old={fetch:globalThis.fetch,window:globalThis.window,location:globalThis.location,sessionStorage:globalThis.sessionStorage};
 try{for(const lang of ['fr','en','de','nl'])for(const existing of [false,true]){
  const calls=[],navigation=[],stored=new Map();let saved=0;
  globalThis.location={origin:'https://accordia.test'};globalThis.window={location:{assign:url=>navigation.push(url)}};globalThis.sessionStorage={setItem:(k,v)=>stored.set(k,v)};
  const p={...props(),lang,compact:false,account:{displayName:'Owner'},participationMode:'two-devices',onSaved(){saved++}};
  if(existing){p.context={id:p.report.id,revision:2};p.hasUnsaved=false}
  globalThis.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.startsWith('/api/reports/')?{report:p.report,revision:3}:url==='/api/sessions'?{id:'test_session',...(existing?{}:{token:'personal_token'})}:{token:'renewed_token'}}};
  const h=componentHarness('features/constat/cloud-panel.tsx','CloudPanel',modules);h.render(p);
  const create=()=>h.nodes(n=>n.type==='Button'&&n.props.children===modules['./start-copy'].startCopy[lang].invite)[0];
  create().props.onClick();await settle();h.render(p);
  assert.deepEqual(navigation,[],'must not redirect through the session safety gate');
  const link='https://accordia.test/session/test_session#invite='+(existing?'renewed_token':'personal_token');
  assert.equal(h.nodes(n=>n.type==='InviteQr')[0].props.link,link);
  assert.equal(h.nodes(n=>n.type==='ShareLinkActions')[0].props.path,link);
  assert.equal(h.nodes(n=>n.type==='a'&&n.props.href==='/session/test_session').length,1);
  assert.equal(h.nodes(n=>n.props.role==='status'&&n.props.children===modules['./start-copy'].startCopy[lang].inviteReady).length,1);
  assert.equal(create().props.disabled,true);assert.equal(saved,existing?0:1);
  assert.equal(stored.get('accordia-share-test_session'),link);
  assert.ok(calls.every(c=>c.options.headers['X-Accordia-Request']==='1'));
  assert.deepEqual(JSON.parse(calls.find(c=>c.url==='/api/sessions').options.body),{reportId:p.report.id});
  // Changing to a different report must never retain the previous private invitation.
  h.render({...p,report:{...p.report,id:'another_report'}});assert.equal(h.nodes(n=>n.type==='InviteQr').length,0);h.unmount();
 }}finally{for(const [k,v] of Object.entries(old))if(v===undefined)delete globalThis[k];else globalThis[k]=v}
});

test('invitation failures preserve the current page and never display a QR or session link',async()=>{
 const old={fetch:globalThis.fetch,window:globalThis.window};
 try{for(const error of ['unauthenticated','origin','conflict','quota']){
  const navigation=[],calls=[];globalThis.window={location:{assign:url=>navigation.push(url)}};
  globalThis.fetch=async(url)=>{calls.push(url);return {ok:false,json:async()=>({error})}};
  const h=componentHarness('features/constat/cloud-panel.tsx','CloudPanel',modules),p={...props(),compact:false,account:{displayName:'Owner'},participationMode:'two-devices'};h.render(p);
  h.nodes(n=>n.type==='Button'&&n.props.children===modules['./start-copy'].startCopy.fr.invite)[0].props.onClick();await settle();h.render(p);
  assert.equal(calls.length,1);assert.equal(h.nodes(n=>n.type==='InviteQr').length,0);assert.deepEqual(navigation,[]);assert.ok(text(h).includes(cloudCopy.fr[error]));h.unmount();
 }}finally{globalThis.fetch=old.fetch;globalThis.window=old.window}
});
