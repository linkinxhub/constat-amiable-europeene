import test from 'node:test';import assert from 'node:assert/strict';
import {PDFDocument,PDFName,PDFArray,PDFDict,PDFString} from 'pdf-lib';
import {pdfAccess,PDF_ACCESS_ORIGIN} from '../features/constat/pdf-access.ts';
import {pdfAccessCopy} from '../features/constat/pdf-access-copy.ts';
import {renderPdf,PDF_RENDERER_VERSION} from '../server/pdf-renderer.ts';
import {pdfFixture} from './pdf-fixture.mjs';
const id='72509dab-e47d-4652-ac8f-3cdf0c4e244e';
test('QR target uses a fixed trusted origin and no invitation token, personal fields or arbitrary URLs',()=>{
 for(const lang of ['fr','en','de','nl']){assert.equal(pdfAccess(id,lang).url,PDF_ACCESS_ORIGIN+'/session/'+id);assert.equal(pdfAccess(undefined,lang).url,PDF_ACCESS_ORIGIN+'/account?lang='+lang);assert.equal(pdfAccess(undefined,lang).shared,false);assert.ok(pdfAccessCopy[lang].guide.length>250)}
 for(const invalid of ['https://evil.invalid','../account',id+'?token=secret',id+'#secret','',id+'/pdf'])assert.throws(()=>pdfAccess(invalid,'fr'),/invalid_pdf_session/);
});
test('each new first-page PDF has a clickable QR to the correct route without mutating source data',async()=>{
 for(const lang of ['fr','en','de','nl'])for(const session of [undefined,id]){
  const report=pdfFixture(),before=JSON.stringify(report),bytes=await renderPdf({report,lang,style:'keyboard',revision:1,digest:'QR-FICTIF',createdAt:'2026-11-01T12:00:00Z',sketch:null,onlineSessionId:session});assert.equal(JSON.stringify(report),before);
  const doc=await PDFDocument.load(bytes),annots=doc.getPage(0).node.lookup(PDFName.of('Annots'),PDFArray);assert.ok(annots);let found=false;
  for(let i=0;i<annots.size();i++){const a=annots.lookup(i,PDFDict),action=a.lookupMaybe(PDFName.of('A'),PDFDict);if(action?.get(PDFName.of('S'))?.toString()==='/URI'){assert.equal(action.lookup(PDFName.of('URI'),PDFString).decodeText(),pdfAccess(session,lang).url);found=true}}
  assert.ok(found);assert.match(doc.getKeywords(),/accordia-multilingual-v5-vehicle-kind/);assert.ok(doc.getPageCount()>1);
 }
 assert.equal(PDF_RENDERER_VERSION,'accordia-multilingual-v5-vehicle-kind');
});
