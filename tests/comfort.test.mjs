import test from 'node:test';import assert from 'node:assert/strict';
import {componentHarness} from './lifecycle-harness.mjs';
import {pdfFixture} from './pdf-fixture.mjs';
import {schema,complete} from '../features/constat/model.ts';
import {vehicleKindIssue} from '../features/constat/vehicle-kind.ts';
import {missingFields,finalMissingFields} from '../features/constat/completeness.ts';
import {questionnaireIssues} from '../features/constat/questionnaire-model.ts';
import {deviceSideReady} from '../features/constat/same-device-model.ts';
import {participantReady} from '../server/participant-progress.ts';
import {finalReady} from '../server/final-service.ts';
import {comfortCopy} from '../features/constat/comfort-copy.ts';
import {entryModeCopy} from '../features/constat/entry-mode-copy.ts';
import {documentFirstCopy} from '../features/constat/document-first-copy.ts';
import {expressEntryAllowed,applyOwnEntry} from '../features/constat/entry-mode-model.ts';
test('vehicle/trailer conflicts block every completion path without erasing draft data',()=>{
 for(const side of [0,1])for(const kind of ['car','van','truck'])for(const key of ['trailerPlate','trailerCountry']){const r=pdfFixture(),v=r.vehicles[side];v.kind=kind;v.extra[key]='TEST-KEEP';const before=JSON.stringify(r);assert.equal(vehicleKindIssue(v),'vehicleConfiguration');assert.equal(complete(r),false);assert.equal(finalReady(r),false);assert.equal(deviceSideReady(r,side),false);assert.equal(participantReady(r,side===0?'A':'B'),false);assert.ok(missingFields(r).some(f=>f.field==='vehicleConfiguration'&&f.vehicle===side));assert.ok(finalMissingFields(r).some(f=>f.field==='vehicleConfiguration'));assert.deepEqual(questionnaireIssues(r,{id:'type',kind:'vehicleType',side}),['vehicleConfiguration']);assert.equal(JSON.stringify(r),before);assert.deepEqual(schema.parse(r).vehicles,r.vehicles);v.kind='truck-trailer';v.extra.trailerPlate='TEST-CORRECT';assert.equal(finalReady(r),true);assert.equal(v.extra[key],key==='trailerPlate'?'TEST-CORRECT':'TEST-KEEP');}
});
test('legacy and other vehicle types retain compatibility; only active contradictory sides block local completion',()=>{
 const r=pdfFixture();r.vehicles[1].extra.trailerPlate='TEST-KEEP';assert.equal(complete(r),true);r.vehicles[1].kind='other';assert.equal(complete(r),true);r.vehicles[1].kind='truck';assert.equal(complete(r),false);r.count='1';assert.equal(complete(r),true);assert.equal(r.vehicles[1].extra.trailerPlate,'TEST-KEEP');
});
const deps={'./comfort-copy':{comfortCopy},'./document-first-copy':{documentFirstCopy},'./entry-mode-copy':{entryModeCopy},'./entry-mode-model':{expressEntryAllowed,applyOwnEntry},'./document-import':{DocumentImport:'DocumentImport'},'@/components/ui/dialog':Object.fromEntries(['Dialog','DialogContent','DialogTitle','DialogDescription','DialogHeader'].map(k=>[k,k]))};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('entry preferences are initially collapsed, make no access call until opened and discard late access on close',async()=>{
 const old=globalThis.fetch;let calls=0,release;globalThis.fetch=()=>{calls++;return new Promise(r=>release=r)};
 try{for(const lang of ['fr','en','de','nl']){calls=0;const r=pdfFixture(),before=JSON.stringify(r),h=componentHarness('features/constat/entry-mode.tsx','EntryMode',deps),p={report:r,side:0,lang,guided:true,onGuided(){},onClassic(){},onChange(){throw Error('must not modify report')}};h.render(p);assert.equal(h.nodes(n=>n.type==='details')[0].props.open,false);assert.equal(calls,0);h.nodes(n=>n.type==='details')[0].props.onToggle({currentTarget:{open:true}});h.render(p);assert.equal(calls,1);h.nodes(n=>n.type==='details')[0].props.onToggle({currentTarget:{open:false}});h.render(p);release({status:200,ok:true,json:async()=>({available:true,mode:'admin_preview'})});await settle();h.render(p);assert.equal(h.nodes(n=>n.type==='details')[0].props.open,false);assert.ok(!h.nodes(n=>n.type==='Button'&&n.props.children===documentFirstCopy[lang].photo).length);assert.equal(JSON.stringify(r),before);h.unmount();}}
 finally{globalThis.fetch=old}
});
