import test from 'node:test';
import assert from 'node:assert/strict';
import {pdfFixture} from './pdf-fixture.mjs';
import {reviewedField,remainingDocumentPages} from '../features/constat/document-first-model.ts';
import {questionnairePages,questionnaireIssues,populatedOptions} from '../features/constat/questionnaire-model.ts';
import {participantReady} from '../server/participant-progress.ts';

test('checked document snapshot skips only unchanged populated own fields, never manual accident facts',()=>{
 const r=pdfFixture();r.id='TEST-FICTIF-DOCUMENT-FIRST';r.vehicles[0].email='test@example.com';r.vehicles[0].address='Adresse fictive';const before=JSON.stringify(r),reviewed={reportId:r.id,side:0,vehicle:structuredClone(r.vehicles[0])},pages=questionnairePages('2',undefined,true,populatedOptions(r));
 const result=remainingDocumentPages(pages,r,reviewed);
 assert.ok(!result.some(p=>p.kind==='base'&&p.side===0&&p.group<4));
 assert.equal(result.filter(p=>p.kind==='base'&&p.side===1).length,5);
 for(const kind of ['safety','time','place','common','witnesses'])assert.ok(result.some(p=>p.kind===kind));
 for(const side of [0,1])assert.ok(result.some(p=>p.kind==='circumstances'&&p.side===side));
 assert.ok(result.some(p=>p.kind==='base'&&p.side===0&&p.group===4));
 for(const field of ['damage','observations','impact'])assert.equal(reviewedField(r,reviewed,0,field,field==='impact'),false);
 assert.equal(JSON.stringify(r),before);
 assert.deepEqual(remainingDocumentPages(pages,r,undefined),pages);
 assert.deepEqual(remainingDocumentPages(pages,r,{...reviewed,reportId:'other'}),pages);
});
test('missing, changed and invalid fields remain editable without hiding the other driver',()=>{
 const r=pdfFixture(),reviewed={reportId:r.id,side:0,vehicle:structuredClone(r.vehicles[0])};
 assert.equal(reviewedField(r,reviewed,0,'driver'),true);assert.equal(reviewedField(r,reviewed,1,'driver'),false);
 r.vehicles[0].driver='Corrigé fictif';assert.equal(reviewedField(r,reviewed,0,'driver'),false);
 r.vehicles[0].email='invalid';reviewed.vehicle.email='invalid';assert.equal(reviewedField(r,reviewed,0,'email'),false);
 r.vehicles[0].policy='';const pages=remainingDocumentPages(questionnairePages('2',0,true,{}),r,reviewed);assert.ok(pages.some(p=>p.kind==='base'&&p.group===3));assert.deepEqual(questionnaireIssues(r,pages.find(p=>p.kind==='base'&&p.group===3)),['policy']);
 r.vehicles[0].standardConfirmed=false;assert.equal(participantReady(r,'A'),false);
});
