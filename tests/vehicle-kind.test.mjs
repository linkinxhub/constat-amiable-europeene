import test from 'node:test';import assert from 'node:assert/strict';
import {PDFDocument,PDFPage} from 'pdf-lib';
import {fresh,schema,vehiclesValid} from '../features/constat/model.ts';
import {vehicleKinds,hasTrailer,vehicleKindValid,vehicleKindIssue,visibleVehicleExtras,applicableVehicleExtras} from '../features/constat/vehicle-kind.ts';
import {vehicleKindCopy} from '../features/constat/vehicle-kind-copy.ts';
import {questionnairePages,questionnaireIssues} from '../features/constat/questionnaire-model.ts';
import {missingFields,finalMissingFields} from '../features/constat/completeness.ts';
import {remainingDocumentPages} from '../features/constat/document-first-model.ts';
import {applyDocumentFields} from '../features/constat/document-model.ts';
import {fieldPresets} from '../features/constat/presets.ts';
import {comfortCopy} from '../features/constat/comfort-copy.ts';
import {componentHarness} from './lifecycle-harness.mjs';
import {pdfFixture} from './pdf-fixture.mjs';
import {renderPdf} from '../server/pdf-renderer.ts';
test('vehicle type survives schema/OCR and enforces trailer registration consistently for each active side',()=>{
 const old=pdfFixture();assert.deepEqual(schema.parse(old).vehicles,old.vehicles);
 for(const a of vehicleKinds)for(const b of vehicleKinds){const r=pdfFixture();r.vehicles.forEach((v,i)=>{v.kind=i?b:a;if(hasTrailer(v))v.extra={...v.extra,trailerPlate:'FICTIF-REMORQUE-'+i}});assert.equal(vehiclesValid(r),true);assert.deepEqual(schema.parse(r).vehicles,r.vehicles);assert.equal(finalMissingFields(r).length,0);
 for(const side of [0,1])if(hasTrailer(r.vehicles[side])){const copy=structuredClone(r);copy.vehicles[side].extra.trailerPlate=' ';assert.equal(vehiclesValid(copy),false);assert.ok(missingFields(copy).some(f=>f.field==='trailerPlate'&&f.vehicle===side));assert.deepEqual(questionnaireIssues(copy,{kind:'vehicleType',id:'type',side}),['trailerPlate']);copy.count='1';assert.equal(vehiclesValid(copy),side===1);}}
 const v={...old.vehicles[0],kind:'truck-trailer',extra:{trailerPlate:'KEEP'}};assert.equal(applyDocumentFields(v,v,[{field:'model',value:'DAF XF',confidence:'high'}]).kind,'truck-trailer');assert.equal(schema.safeParse({...old,vehicles:[{...old.vehicles[0],kind:'invalid'},old.vehicles[1]]}).success,false);
});
test('guided type page is own-side only, is never skipped by OCR, and selected types avoid duplicate trailer questions',()=>{
 const r=pdfFixture();r.vehicles[1].kind='truck-trailer';r.vehicles[1].extra.trailerPlate='TEST-REMORQUE';const reviewed={reportId:r.id,side:1,vehicle:structuredClone(r.vehicles[1])};const pages=remainingDocumentPages(questionnairePages('2',1,false),r,reviewed);assert.equal(pages[0].kind,'vehicleType');assert.ok(pages.every(p=>p.side===1));assert.deepEqual(visibleVehicleExtras(r.vehicles[1],['registrationCountry','trailerPlate','trailerCountry']),['registrationCountry']);assert.equal(vehicleKindValid(r.vehicles[1]),true);assert.deepEqual(applicableVehicleExtras({...r.vehicles[0],kind:'car'},['trailerPlate','driverPhone']),['driverPhone']);assert.deepEqual(applicableVehicleExtras({...r.vehicles[0],kind:'car',extra:{trailerPlate:'KEEP'}},['trailerPlate','driverPhone']),['trailerPlate','driverPhone']);assert.ok(fieldPresets('model','fr','truck').some(p=>p.value==='DAF'));assert.ok(!fieldPresets('model','fr','truck').some(p=>p.value==='BMW'));
});
test('real vehicle selector retains prior values and presents trailer fields only when applicable, in four languages',()=>{
 for(const lang of ['fr','en','de','nl'])for(const kind of vehicleKinds){let v={...fresh().vehicles[0],kind};const h=componentHarness('features/constat/vehicle-kind-fields.tsx','VehicleKindFields',{'./comfort-copy':{comfortCopy},'./vehicle-kind':{vehicleKindIssue,vehicleKinds,hasTrailer,trailerRecorded:x=>!!(x.extra?.trailerPlate?.trim()||x.extra?.trailerCountry?.trim())},'./vehicle-kind-copy':{vehicleKindCopy},'@/components/ui/native-select':{NativeSelect:'NativeSelect',NativeSelectOption:'NativeSelectOption'},'@/components/ui/input':{Input:'Input'}}),props=()=>({value:v,lang,onChange:n=>v=n});h.render(props());assert.equal(h.nodes(n=>n.type==='Input').length,hasTrailer(v)?2:0);if(hasTrailer(v)){h.nodes(n=>n.type==='Input')[0].props.onChange({target:{value:'TEST-KEEP'}});h.render(props());h.nodes(n=>n.type==='NativeSelect')[0].props.onChange({target:{value:'car'}});h.render(props());assert.equal(v.extra.trailerPlate,'TEST-KEEP');assert.equal(h.nodes(n=>n.type==='Input').length,2);}h.unmount();}
});
test('real PDF renders A/B types and trailer details, retains originals, and fits short type headers in four languages',async()=>{
 const original=PDFPage.prototype.drawText;let texts=[];PDFPage.prototype.drawText=function(s,o){texts.push(s);return original.call(this,s,o)};
 try{for(const lang of ['fr','en','de','nl']){texts=[];const r=pdfFixture();r.vehicles[0].kind='truck-trailer';r.vehicles[0].extra.trailerPlate='FICTIF-TRAILER-001';r.vehicles[1].kind='car';const before=JSON.stringify(r);const bytes=await renderPdf({report:r,revision:1,lang,style:'keyboard',digest:'TEST-VEHICLE-TYPE',createdAt:'2026-11-02T00:00:00Z',sketch:null});assert.ok(texts.some(t=>t.includes(vehicleKindCopy[lang].types['truck-trailer'])));assert.ok(texts.some(t=>t.includes(vehicleKindCopy[lang].pdfTypes['truck-trailer'])));assert.ok(texts.includes(vehicleKindCopy.fr.pdfTypes['truck-trailer']),'type must also reach the real French reference page');assert.ok(texts.some(t=>t.includes('FICTIF-TRAILER-001')));assert.equal(JSON.stringify(r),before);assert.ok((await PDFDocument.load(bytes)).getPageCount()>0);}}
 finally{PDFPage.prototype.drawText=original}
});
