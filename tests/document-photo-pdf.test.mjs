import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument,PDFPage,PDFName,PDFDict,PDFArray,PDFRawStream,decodePDFRawStream} from 'pdf-lib';
import {renderPdf} from '../server/pdf-renderer.ts';
import {fresh} from '../features/constat/model.ts';
import {applyDocumentFields} from '../features/constat/document-model.ts';
import {defaultDocumentSelection} from '../features/constat/document-batch.ts';
import {pdfFixture} from './pdf-fixture.mjs';
test('reviewed document values reach the real PDF and attached report without merging driver and policyholder or adding source papers',async()=>{
 const report=pdfFixture(),texts=[],original=PDFPage.prototype.drawText;
 PDFPage.prototype.drawText=function(text,options){texts.push(text);return original.call(this,text,options)};
 try{
  const originalB=structuredClone(report.vehicles[1]);
  const blank={...fresh().vehicles[0],damage:'DECLARATION MANUELLE A',observations:'FAITS CONFIRMES PAR A'};
  const readings=[{source:'TEST licence front',result:{fields:[{field:'driver',value:'TESTDRIVERAXYZ',confidence:'high'},{field:'licenceNumber',value:'LICENCE-FICTIVE-001',confidence:'high'}]}},{source:'TEST insurance',result:{fields:[{field:'policyholder',value:'TESTINSUREDXYZ',confidence:'high'},{field:'insurer',value:'TESTASSUREURXYZ',confidence:'high'},{field:'policy',value:'POLICE-FICTIVE-001',confidence:'high'}]}},{source:'TEST registration',result:{fields:[{field:'plate',value:'TEST-A-001',confidence:'high'},{field:'model',value:'TESTVEHICULEXYZ',confidence:'high'}]}}];
  report.vehicles[0]=applyDocumentFields(blank,blank,defaultDocumentSelection(blank,readings));
  assert.deepEqual(report.vehicles[1],originalB);
  const bytes=await renderPdf({report,lang:'fr',style:'keyboard',revision:0,digest:'TEST-FICTIF-PHOTO',createdAt:'2026-11-01T12:00:00Z',sketch:null});
  for(const expected of ['TESTDRIVERAXYZ','TESTINSUREDXYZ','TESTASSUREURXYZ','TEST-A-001'])assert.ok(texts.join(' ').includes(expected),expected);
  const doc=await PDFDocument.load(bytes),names=doc.catalog.lookup(PDFName.of('Names'),PDFDict).lookup(PDFName.of('EmbeddedFiles'),PDFDict).lookup(PDFName.of('Names'),PDFArray);
  assert.equal(names.size(),2);assert.equal(names.lookup(0).decodeText(),'accordia-original-data.json');
  const stream=names.lookup(1,PDFDict).lookup(PDFName.of('EF'),PDFDict).lookup(PDFName.of('F'),PDFRawStream),saved=JSON.parse(new TextDecoder().decode(decodePDFRawStream(stream).decode()));
  assert.equal(saved.report.vehicles[0].driver,'TESTDRIVERAXYZ');assert.equal(saved.report.vehicles[0].policyholder,'TESTINSUREDXYZ');assert.equal(saved.report.vehicles[0].damage,'DECLARATION MANUELLE A');assert.equal(saved.report.vehicles[0].extra.licenceNumber,'LICENCE-FICTIVE-001');assert.deepEqual(saved.report.vehicles[1],originalB);
  assert.equal(JSON.stringify(saved).includes('TEST licence front'),false);assert.equal(report.photos.length,0);
 }finally{PDFPage.prototype.drawText=original}
});
