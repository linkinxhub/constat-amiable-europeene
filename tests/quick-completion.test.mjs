import {reportForDocument} from '../features/constat/document-scope.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {deviceSideReady,deviceCompletionKey} from '../features/constat/same-device-model.ts';
import {participantReady} from '../server/participant-progress.ts';
import {questionnairePages,questionnaireIssues} from '../features/constat/questionnaire-model.ts';
import {missingFields} from '../features/constat/completeness.ts';
import {quickFlowCopy} from '../features/constat/quick-flow-copy.ts';
import {pdfFixture} from './pdf-fixture.mjs';
import {fresh,schema} from '../features/constat/model.ts';

test('local A/B completion matches shared participant prerequisites, including common facts for A',()=>{
 const r=pdfFixture();
 for(const side of [0,1])assert.equal(deviceSideReady(r,side),participantReady(r,side===0?'A':'B'));
 for(const patch of [{place:''},{date:'2099-01-01'},{injured:''},{injured:'yes'},{otherObjectsDamage:''},{otherVehiclesDamage:''}]){
  const n={...r,...patch};assert.equal(deviceSideReady(n,0),false);assert.equal(deviceSideReady(n,1),true);assert.equal(deviceSideReady(n,0),participantReady(n,'A'));
 }
 const b=structuredClone(r);b.vehicles[1].email='invalid';assert.equal(deviceSideReady(b,1),false);assert.equal(deviceSideReady(b,0),true);
 const uncertain=structuredClone(r);uncertain.vehicles[0].standardConfirmed=false;assert.equal(deviceSideReady(uncertain,0),false);
});
test('representative guided forms in all languages and 1/2 vehicle variants reach review without extra optional data',()=>{
 for(const lang of ['fr','en','de','nl'])for(const count of ['1','2']){
  const r=pdfFixture();r.count=count;r.readingLanguages=[lang,lang];
  for(const v of r.vehicles){v.extra=undefined;v.email='';v.address='';v.damage='';}
  const before=JSON.stringify(r),pages=questionnairePages(count,undefined,true,{});
  for(const p of pages)assert.deepEqual(questionnaireIssues(r,p),[],`${lang}/${count}/${p.id}`);
  assert.deepEqual(missingFields(r),[]);assert.ok(schema.safeParse(r).success);assert.equal(JSON.stringify(r),before);
 }
});
test('guided constraints reject invalid date/time/place/email, missing insurance and unconfirmed circumstances',()=>{
 const r=pdfFixture(),page=kind=>questionnairePages('2').find(p=>p.kind===kind);
 for(const patch of [{date:'2026-02-30'},{time:'25:00'},{date:'2099-01-01'}])assert.ok(questionnaireIssues({...r,...patch},page('time')).length);
 assert.deepEqual(questionnaireIssues({...r,place:'  '},page('place')),['place']);
 for(const field of ['driver','policyholder','plate','model','insurer','policy','email']){
  const n=structuredClone(r);n.vehicles[0][field]=field==='email'?'not-an-email':'  ';
  const p=questionnairePages('2').find(p=>p.kind==='base'&&p.side===0&&questionnaireIssues(n,p).includes(field));assert.ok(p,field);
 }
 const n=structuredClone(r);n.vehicles[0].standardConfirmed=false;assert.ok(questionnaireIssues(n,page('circumstances')).length);
 assert.ok(questionnaireIssues(fresh(),page('safety')).includes('count'));
});
test('finishing cannot survive a common-fact edit or own-side correction, but B editing keeps A data',()=>{
 const r=pdfFixture(),before=structuredClone(r),a=deviceCompletionKey(r,0),b=deviceCompletionKey(r,1);
 r.vehicles[1].damage='Test fictif corrigé';assert.equal(deviceCompletionKey(r,0),a);assert.notEqual(deviceCompletionKey(r,1),b);assert.deepEqual(r.vehicles[0],before.vehicles[0]);
 r.place='Autre lieu fictif';assert.notEqual(deviceCompletionKey(r,0),a);
});
test('short subject titles and completion guidance have parity in four languages',()=>{
 for(const lang of ['fr','en','de','nl']){assert.deepEqual(Object.keys(quickFlowCopy[lang]),Object.keys(quickFlowCopy.fr));assert.equal(quickFlowCopy[lang].groups.length,5);assert.ok(quickFlowCopy[lang].groups.every(x=>x.length<60));}
});

test('one-vehicle export excludes inactive B data and photos without erasing the editable draft',()=>{
 const r=pdfFixture();r.count='1';r.photos=[{name:'a',side:'A',data:'data:image/png;base64,AAAA'},{name:'private-b',side:'B',data:'data:image/png;base64,AAAA'},{name:'common',data:'data:image/png;base64,AAAA'}];
 const before=JSON.stringify(r),out=reportForDocument(r);
 assert.deepEqual(out.vehicles[1],fresh().vehicles[1]);assert.deepEqual(out.vehicles[0],r.vehicles[0]);assert.deepEqual(out.photos.map(p=>p.name),['a','common']);assert.equal(JSON.stringify(r),before);
 assert.ok(r.vehicles[1].driver);assert.ok(r.photos.some(p=>p.side==='B'));r.count='2';assert.equal(reportForDocument(r),r);
});
