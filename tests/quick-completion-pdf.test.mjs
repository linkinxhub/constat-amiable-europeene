import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFDocument,PDFPage,PDFName,PDFDict,PDFArray,PDFRawStream,decodePDFRawStream} from 'pdf-lib';
import {renderPdf} from '../server/pdf-renderer.ts';
import {pdfFixture} from './pdf-fixture.mjs';

function originalData(doc){
 const names=doc.catalog.lookup(PDFName.of('Names'),PDFDict).lookup(PDFName.of('EmbeddedFiles'),PDFDict).lookup(PDFName.of('Names'),PDFArray);
 for(let i=0;i<names.size();i+=2){if(names.lookup(i).decodeText()==='accordia-original-data.json'){
  const spec=names.lookup(i+1,PDFDict),stream=spec.lookup(PDFName.of('EF'),PDFDict).lookup(PDFName.of('F'),PDFRawStream);
  return JSON.parse(new TextDecoder().decode(decodePDFRawStream(stream).decode()));
 }}throw Error('Missing original data attachment');
}
test('24 PDF variants preserve active facts; a one-vehicle file never exposes hidden B in text or attached JSON',async()=>{
 const original=PDFPage.prototype.drawText,texts=[];PDFPage.prototype.drawText=function(text,options){texts.push(text);return original.call(this,text,options)};
 try{for(const lang of ['fr','en','de','nl'])for(const style of ['keyboard','blue-pen','black-pen'])for(const count of ['1','2']){
  const report=pdfFixture();report.count=count;report.vehicles[0].driver='ACTIFAXYZ123';report.vehicles[1].driver='PRIVATEBXYZ917';const before=JSON.stringify(report);texts.length=0;
  const bytes=await renderPdf({report,lang,style,revision:0,digest:'TEST-FICTIF-RECETTE',createdAt:'2026-11-01T12:00:00Z',sketch:null}),doc=await PDFDocument.load(bytes),saved=originalData(doc);
  assert.ok(doc.getPageCount()>=1);assert.ok(texts.join(' ').includes('ACTIFAXYZ123'));assert.equal(texts.join(' ').includes('PRIVATEBXYZ917'),count==='2');
  assert.equal(saved.report.vehicles[0].driver,'ACTIFAXYZ123');assert.equal(saved.report.vehicles[1].driver,count==='2'?'PRIVATEBXYZ917':'');assert.equal(saved.report.count,count);assert.equal(saved.lang,lang);assert.equal(saved.style,style);assert.equal(JSON.stringify(report),before);
 }}finally{PDFPage.prototype.drawText=original}
});
test('B-attributed photos do not become embedded attachments in a one-vehicle PDF',async()=>{
 const report=pdfFixture();report.count='1';report.photos=[{side:'B',name:'PRIVATE-B-PHOTO',data:'data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64')}];
 const bytes=await renderPdf({report,lang:'fr',style:'keyboard',revision:0,digest:'TEST-FICTIF',createdAt:'2026-11-01T12:00:00Z',sketch:null}),doc=await PDFDocument.load(bytes);
 assert.deepEqual(originalData(doc).report.photos,[]);const names=doc.catalog.lookup(PDFName.of('Names'),PDFDict).lookup(PDFName.of('EmbeddedFiles'),PDFDict).lookup(PDFName.of('Names'),PDFArray);
 assert.equal(names.size(),2);assert.equal(report.photos[0].name,'PRIVATE-B-PHOTO');
});
