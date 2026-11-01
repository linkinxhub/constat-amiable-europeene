import test from 'node:test';import assert from 'node:assert/strict';
import {invitationPath} from '../features/constat/join-model.ts';
import {experienceCopy} from '../features/constat/experience-copy.ts';
import {questionnairePages,populatedOptions,safeOptions} from '../features/constat/questionnaire-model.ts';
import {fresh} from '../features/constat/model.ts';
const origin='https://accordia.example',id='12345678-1234-1234-1234-123456789012',token='a'.repeat(72);
test('join accepts only a local session invitation and keeps the token in the fragment',()=>{
 assert.equal(invitationPath(`${origin}/session/${id}#invite=${token}`,origin),`/session/${id}#invite=${token}`);
 for(const input of [`https://evil.example/session/${id}#invite=${token}`,`javascript:alert(1)`,`${origin}/session/${id}`,`${origin}/session/x#invite=${token}`,`${origin}/session/${id}?invite=${token}#invite=${token}`,`${origin}/account#invite=${token}`,`${origin}/session/${id}#invite=${token}&invite=${token}`])assert.throws(()=>invitationPath(input,origin));
});
test('optional details shorten the questionnaire without deleting prior vehicle data',()=>{
 const r=fresh();r.count='2';const selections=populatedOptions(r),all=questionnairePages('2');
 const brief=questionnairePages('2',undefined,true,selections);assert.ok(brief.length<all.length);assert.ok(!brief.some(p=>p.kind==='extra'));assert.equal(brief.filter(p=>p.kind==='options').length,2);
 r.vehicles[1].extra={trailerPlate:'KEPT'};const options=populatedOptions(r);assert.equal(options['1-3'],true);
 assert.ok(questionnairePages('2',1,false,options).some(p=>p.kind==='extra'&&p.group===3));
 options['1-3']=false;questionnairePages('2',1,false,options);assert.equal(r.vehicles[1].extra.trailerPlate,'KEPT');
 assert.ok(questionnairePages('2',1,false,options).every(p=>p.side===1));
});
test('saved conditional choices reject unrelated keys and non boolean values',()=>{
 assert.deepEqual(safeOptions({'0-1':true,'1-4':false,'9-1':true,place:'secret','0-0':'true'}),{'0-1':true,'1-4':false});assert.deepEqual(safeOptions(null),{});
});
test('experience information has parity across all four languages',()=>{
 for(const lang of ['fr','en','de','nl']){assert.deepEqual(Object.keys(experienceCopy[lang]),Object.keys(experienceCopy.fr));assert.equal(experienceCopy[lang].stages.length,5);assert.equal(experienceCopy[lang].steps.length,3);}
});
