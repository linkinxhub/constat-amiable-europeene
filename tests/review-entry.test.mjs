import test from 'node:test';
import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {pdfFixture} from './pdf-fixture.mjs';
import {dictionaries} from '../features/constat/i18n.ts';
import {reviewEntryCopy} from '../features/constat/review-entry-copy.ts';
import {quickFlowCopy} from '../features/constat/quick-flow-copy.ts';
import {experienceCopy} from '../features/constat/experience-copy.ts';
import {cityLabel} from '../features/constat/geocoding.ts';
import {repairCopy} from '../features/constat/repair-copy.ts';
import {eventZone} from '../features/constat/event-time.ts';
import {finalCopy,extraLabels} from '../features/constat/final-copy.ts';
import {extraFields,standardCircumstances} from '../features/constat/final-model.ts';
const deps={'./review-entry-copy':{reviewEntryCopy},'./quick-flow-copy':{quickFlowCopy},'./flow-steps':{FlowSteps:'FlowSteps'},'./experience-copy':{experienceCopy},'./geocoding':{cityLabel},'./repair-copy':{repairCopy},'./event-time':{eventZone},'./i18n':{dictionaries},'./final-copy':{finalCopy,extraLabels},'./final-model':{extraFields,standardCircumstances},'./evidence':{SketchView:'SketchView'}};
test('review completion opens only the permitted vehicle and never mutates data in every language',()=>{
 for(const lang of ['fr','en','de','nl'])for(const side of [undefined,0,1]){
  const r=pdfFixture();for(const v of r.vehicles)v.extra={impact:'TEST'};const before=JSON.stringify(r),calls=[];
  const h=componentHarness('features/constat/review.tsx','Review',deps);
  h.render({r,t:dictionaries[lang],editableSide:side,onEdit:(...args)=>calls.push(args)});
  const buttons=h.nodes(n=>n.type==='button'&&n.props.children===reviewEntryCopy[lang].complete);
  assert.equal(buttons.length,side===undefined?2:1);
  buttons.forEach(n=>n.props.onClick());
  assert.deepEqual(calls,side===undefined?[[1,0,true],[1,1,true]]:[[1,side,true]]);
  assert.equal(JSON.stringify(r),before);
  assert.equal(h.nodes(n=>n.type==='p'&&n.props.children===reviewEntryCopy[lang].readonly).length,side===undefined?0:1);
 }
});
test('read-only document exposes no completion command and populated details remain visible',()=>{
 const r=pdfFixture();r.vehicles[0].extra=Object.fromEntries(extraFields.map(k=>[k,'TEST '+k]));
 const h=componentHarness('features/constat/review.tsx','Review',deps);h.render({r,t:dictionaries.fr});
 assert.equal(h.nodes(n=>n.type==='button').length,0);
 assert.equal(h.nodes(n=>n.props?.className==='review-empty-controls no-print').length,1);
});
