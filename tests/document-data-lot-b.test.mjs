import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh} from '../features/constat/model.ts';
import {documentState} from '../features/constat/document-status.ts';
import {documentStatusCopy} from '../features/constat/document-status-copy.ts';
import {draftExport,draftMatches,draftFilename} from '../features/constat/draft-data.ts';
import {draftDataCopy} from '../features/constat/draft-data-copy.ts';
import {componentHarness} from './lifecycle-harness.mjs';

test('document states never infer a signature from readiness or completion, and stale versions take priority',()=>{
 assert.equal(documentState({prepared:false,ready:true,signedA:true,signedB:true}),'draft');
 assert.equal(documentState({prepared:true,unsigned:true,ready:true}),'unsigned');
 assert.equal(documentState({prepared:true,ready:true}),'review');
 assert.equal(documentState({prepared:true,signedA:true}),'partial');
 assert.equal(documentState({prepared:true,signedB:true}),'partial');
 assert.equal(documentState({prepared:true,signedA:true,signedB:true}),'assembling');
 assert.equal(documentState({prepared:true,signedA:true,signedB:true,ready:true}),'signed');
 assert.equal(documentState({prepared:true,signedA:true,signedB:true,ready:true,stale:true}),'historical');
 for(const lang of ['fr','en','de','nl'])for(const key of ['draft','unsigned','review','partial','assembling','signed','historical','guide','notice'])assert.ok(documentStatusCopy[lang][key]);
});
test('JSON backup preserves original data, photos, manual sketch, A/B and languages without changing the draft',()=>{
 const r=fresh();r.id='synthetic_draft_export';r.readingLanguages=['de','nl'];r.vehicles[0].driver='A original';r.vehicles[1].policyholder='B original';r.strokes=[[{x:12,y:20},{x:40,y:50}]];r.photos=[{name:'original.png',side:'B',data:'data:image/png;base64,'+readFileSync('tests/fixtures/signature-test.png').toString('base64')}];
 const before=structuredClone(r),data=JSON.parse(draftExport(r));assert.equal(data.format,'accordia-local-draft');assert.equal(data.version,1);assert.deepEqual(data.report,r);assert.deepEqual(r,before);assert.ok(draftMatches(data.report,r));
 assert.equal(draftMatches({...r,place:'Changed concurrently'},r),false);assert.equal(draftMatches({invalid:true},r),false);assert.match(draftFilename('../bad/<id>'),/^Accordia-brouillon-badid\.json$/);
});
test('local deletion requires confirmation, can be cancelled, prevents double submission and reports conflicts without claiming success',async()=>{
 for(const lang of ['fr','en','de','nl']){
  let calls=0,deleted=0,finish;const r={...fresh(),id:'synthetic_local_delete'},next={...r,place:'new'};
  const h=componentHarness('features/constat/draft-data-actions.tsx','DraftDataActions',{'./storage':{deleteDraft:()=>{calls++;return new Promise((resolve,reject)=>{finish={resolve,reject}})}},'./draft-data':{draftExport,draftFilename},'./draft-data-copy':{draftDataCopy}});
  let props={report:r,lang,disabled:false,onDeleted:()=>deleted++};const c=draftDataCopy[lang];const button=label=>h.nodes(n=>n.type==='Button'&&n.props.children===label)[0];
  h.render(props);assert.equal(button(c.confirm),undefined);button(c.remove).props.onClick();h.render(props);assert.ok(button(c.confirm));button(c.cancel).props.onClick();h.render(props);assert.equal(calls,0);assert.equal(button(c.confirm),undefined);
  button(c.remove).props.onClick();h.render(props);const confirm=button(c.confirm);confirm.props.onClick();confirm.props.onClick();assert.equal(calls,1);finish.reject(new Error('conflict'));await new Promise(resolve=>setImmediate(resolve));h.render(props);assert.equal(deleted,0);assert.ok(h.nodes(n=>n.props?.role==='alert'&&n.props.children===c.conflict).length);
  button(c.remove).props.onClick();h.render(props);props={...props,report:next};h.render(props);assert.equal(button(c.confirm),undefined,'new snapshot cancels old confirmation');
  button(c.remove).props.onClick();h.render(props);button(c.confirm).props.onClick();finish.resolve();await new Promise(resolve=>setImmediate(resolve));assert.equal(deleted,1);h.unmount();
 }
});
test('export is a local download with revocable URL and all changed commands are documented in the four languages',()=>{
 const create=URL.createObjectURL,revoke=URL.revokeObjectURL;let created=0,revoked=[];
 URL.createObjectURL=()=>{created++;return 'blob:synthetic-backup'};URL.revokeObjectURL=url=>revoked.push(url);
 try{const h=componentHarness('features/constat/draft-data-actions.tsx','DraftDataActions',{'./storage':{deleteDraft:()=>assert.fail('export must not delete')},'./draft-data':{draftExport,draftFilename},'./draft-data-copy':{draftDataCopy}});const r={...fresh(),id:'synthetic_export'};const props={report:r,lang:'fr',disabled:false,onDeleted:()=>assert.fail()};h.render(props);h.nodes(n=>n.type==='Button'&&n.props.children===draftDataCopy.fr.export)[0].props.onClick();h.render(props);const a=h.nodes(n=>n.type==='a')[0];assert.equal(created,1);assert.equal(a.props.href,'blob:synthetic-backup');assert.equal(a.props.download,draftFilename(r.id));h.render({...props,report:{...r,place:'changed'}});assert.equal(h.nodes(n=>n.type==='a').length,0);assert.deepEqual(revoked,['blob:synthetic-backup']);h.unmount();}finally{URL.createObjectURL=create;URL.revokeObjectURL=revoke}
 for(const file of ['usage-guide.tsx','guide-context.tsx','tutorial.tsx']){const s=readFileSync('features/constat/'+file,'utf8');assert.ok(s.includes('draftDataCopy[lang].guide'));assert.ok(s.includes('documentStatusCopy[lang].guide'))}
});
