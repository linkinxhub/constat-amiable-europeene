import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFPage,PDFDocument} from 'pdf-lib';
import {pdfTextLines} from '../server/pdf-text.ts';
import {renderPdf,stampPdf} from '../server/pdf-renderer.ts';
import {finalCopy} from '../features/constat/final-copy.ts';
import {pdfFixture} from './pdf-fixture.mjs';
test('A06: word wrapping preserves words, paragraphs and overlong identifiers',()=>{
 assert.deepEqual(pdfTextLines('Une signature électronique qualifiée',25,s=>s.length),['Une signature','électronique qualifiée']);
 assert.deepEqual(pdfTextLines('abcdefghi\n\nsecond',4,s=>s.length),['abcd','efgh','i','','seco','nd']);
 for(const c of Object.values(finalCopy)){const lines=pdfTextLines(c.note,55,s=>s.length);assert.equal(lines.join(' '),c.note.trim().replace(/\s+/g,' '));assert.ok(lines.every(s=>s.length<=55));}
});
test('A05/A06: actual PDF note and correction do not overlap; final declarations retain words in four languages',async()=>{
 const original=PDFPage.prototype.drawText,calls=[];
 PDFPage.prototype.drawText=function(text,options){calls.push({page:this,text,...options});return original.call(this,text,options);};
 try{
  const data='data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64');
  const sig={data,kind:'drawn',at:'2026-10-23T10:00:00Z',by:'TEST-FICTIF'};
  for(const lang of ['fr','en','de','nl']){
   calls.length=0;const c=finalCopy[lang];
   const source=await renderPdf({report:pdfFixture(),revision:1,style:'keyboard',lang,digest:'TEST-FICTIF-CONTROLE',createdAt:sig.at,sketch:null});
   const correction=calls.find(v=>v.text.startsWith(c.correction.slice(0,20)));assert.ok(correction,lang);
   const start=calls.findIndex(v=>v.text.startsWith(c.note.slice(0,20)));assert.ok(start>=0);
   const note=calls.slice(start,calls.indexOf(correction)).filter(v=>v.page===correction.page);
   assert.ok(note.length>=1);assert.ok(correction.y+correction.size<=note.at(-1).y-2,lang+' annex overlap');
   calls.length=0;const signed=await stampPdf(source,[sig,sig],lang,'a'.repeat(64));
   const title=calls.find(v=>v.text==='Accordia - '+c.signature);const texts=calls.filter(v=>v.page===title.page).map(v=>v.text);
   const begin=texts.findIndex(v=>v.startsWith(c.note.slice(0,20)));const end=texts.findIndex(v=>v.startsWith('A - '));
   assert.equal(texts.slice(begin,end).join(' '),c.note.trim().replace(/\s+/g,' '),lang+' broken word');
   assert.equal((await PDFDocument.load(signed)).getPageCount(),(await PDFDocument.load(source)).getPageCount()+1);
  }
 }finally{PDFPage.prototype.drawText=original;}
});
