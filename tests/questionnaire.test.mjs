import test from 'node:test';import assert from 'node:assert/strict';
import {questionnairePages,questionGroups} from '../features/constat/questionnaire-model.ts';
import {detailGroups} from '../features/constat/detail-groups.ts';
import {extraFields} from '../features/constat/final-model.ts';
import {questionnaireCopy} from '../features/constat/questionnaire-copy.ts';
import {fresh,schema} from '../features/constat/model.ts';
test('chronological questionnaire covers every editable vehicle field without duplicating extras',()=>{
 const pages=questionnairePages('2');
 assert.deepEqual(pages.slice(0,4).map(p=>p.kind),['safety','time','place','common']);
 assert.equal(pages.at(-1).kind,'witnesses');
 assert.equal(new Set(pages.map(p=>p.id)).size,pages.length);
 for(const side of [0,1]){
  const fields=pages.filter(p=>p.side===side&&p.kind==='extra').flatMap(p=>detailGroups[p.group].slice(p.offset,p.offset+3));
  assert.deepEqual(fields.slice().sort(),[...extraFields].sort());
  assert.equal(new Set(fields).size,fields.length);
  const basic=pages.filter(p=>p.side===side&&p.kind==='base').flatMap(p=>questionGroups[p.group]);
  assert.deepEqual(basic.slice().sort(),['driver','policyholder','plate','model','insurer','policy','email','address','damage','observations'].sort());
 }
});
test('participant scope excludes the other vehicle and common data for B or shared device',()=>{
 for(const side of [0,1]){
  const pages=questionnairePages('2',side,false);
  assert.ok(pages.length>0);assert.ok(pages.every(p=>p.side===side));
 }
 assert.ok(questionnairePages('1').every(p=>p.side!==1));
 assert.ok(questionnairePages('2',0,true).some(p=>p.kind==='place'));
 assert.ok(questionnairePages('2',0,true).every(p=>p.side!==1));
});
test('navigation planning does not mutate existing answers or the hidden second vehicle',()=>{
 const report=fresh();report.count='1';report.vehicles[1].driver='Preserved';const before=JSON.stringify(report);
 questionnairePages(report.count);questionnairePages('2');
 assert.equal(JSON.stringify(report),before);assert.equal(schema.parse(report).vehicles[1].driver,'Preserved');
});
test('shared questionnaire description has the same keys in all four languages',()=>{
 for(const lang of ['fr','en','de','nl']){
 assert.deepEqual(Object.keys(questionnaireCopy[lang]),Object.keys(questionnaireCopy.fr));
 for(const text of Object.values(questionnaireCopy[lang]))assert.ok(text.trim());
 }
});

import {questionnaireIssues,questionnaireCursor} from '../features/constat/questionnaire-model.ts';
test('guided required answers use report rules without forcing optional details',()=>{
 const r=fresh();r.injured='';r.count='';
 assert.deepEqual(questionnaireIssues(r,{id:'safety',kind:'safety'}),['injured','count']);
 r.injured='no';r.count='2';assert.deepEqual(questionnaireIssues(r,{id:'safety',kind:'safety'}),[]);
 r.date='2099-01-01';r.time='12:00';assert.deepEqual(questionnaireIssues(r,{id:'time',kind:'time'}),['date','time']);
 r.place='  ';assert.deepEqual(questionnaireIssues(r,{id:'place',kind:'place'}),['place']);
 r.vehicles[1].driver='B';r.vehicles[1].email='bad';
 assert.deepEqual(questionnaireIssues(r,{id:'B',kind:'base',side:1,group:0}),['email']);
 assert.deepEqual(questionnaireIssues(r,{id:'extra',kind:'extra',side:1,group:0,offset:0}),[]);
 r.vehicles[1].email='b@example.com';assert.deepEqual(questionnaireIssues(r,{id:'B',kind:'base',side:1,group:0}),[]);
});
test('cursor resumes only pages available to the current participant and vehicle count',()=>{
 const b=questionnairePages('2',1,false);assert.equal(questionnaireCursor(b,b[4].id),b[4].id);
 assert.equal(questionnaireCursor(b,'0-base-0'),b[0].id);
 assert.equal(questionnaireCursor(questionnairePages('1'),'1-base-0'),'safety');
 assert.equal(questionnaireCursor(b,null),b[0].id);
});
