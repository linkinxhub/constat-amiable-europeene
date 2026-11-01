import test from 'node:test';
import assert from 'node:assert/strict';
import {documentCandidates,defaultDocumentSelection,DOCUMENT_BATCH_LIMIT} from '../features/constat/document-batch.ts';
import {validDocumentSource,prepareDocument} from '../features/constat/document-photo.ts';
import {documentPhotoCopy} from '../features/constat/document-photo-copy.ts';
import {applyDocumentFields} from '../features/constat/document-model.ts';
import {fresh} from '../features/constat/model.ts';
const reading=(source,field,value,confidence='high')=>({source,result:{fields:[{field,value,confidence}]}});
test('batch keeps provenance, groups exact matches and never selects contradictory or uncertain values',()=>{
 const readings=[reading('front','driver','TEST'),reading('back','driver','TEST'),reading('car','plate','A-1'),reading('insurance','plate','B-2'),reading('licence','licenceNumber','X','uncertain')];
 const before=structuredClone(readings),candidates=documentCandidates(readings);
 assert.deepEqual(candidates.find(x=>x.field==='driver').values[0].sources,['front','back']);
 assert.equal(candidates.find(x=>x.field==='plate').values.length,2);
 assert.deepEqual(defaultDocumentSelection(fresh().vehicles[0],readings),[{field:'driver',value:'TEST',confidence:'high'}]);
 assert.deepEqual(readings,before);
 const mixed=[reading('one','driver','TEST'),reading('two','driver','TEST','uncertain')];
 assert.deepEqual(defaultDocumentSelection(fresh().vehicles[0],mixed),[]);
});
test('existing values require selection; batch insertion remains atomic and protects concurrent corrections',()=>{
 const v=fresh().vehicles[0];v.driver='EXISTING';v.damage='MANUAL';
 const result=defaultDocumentSelection(v,[reading('id','driver','OTHER'),reading('car','plate','TEST-A')]);
 assert.equal(result.length,1);assert.equal(result[0].field,'plate');
 assert.equal(applyDocumentFields(v,v,result).damage,'MANUAL');
 assert.throws(()=>applyDocumentFields({...v,plate:'CORRECTION'},v,result),/document_conflict/);
 assert.equal(v.plate,'');
});
test('source budgets distinguish smartphone photos from PDF and reject unsupported or empty files',()=>{
 assert.equal(DOCUMENT_BATCH_LIMIT,5);
 for(const type of ['image/jpeg','image/png','image/webp']){
  assert.equal(validDocumentSource({type,size:20*1024*1024}),true);
  assert.equal(validDocumentSource({type,size:20*1024*1024+1}),false);
 }
 assert.equal(validDocumentSource({type:'application/pdf',size:3*1024*1024}),true);
 assert.equal(validDocumentSource({type:'application/pdf',size:3*1024*1024+1}),false);
 assert.equal(validDocumentSource({type:'image/heic',size:100}),false);
 assert.equal(validDocumentSource({type:'image/png',size:0}),false);
});
test('photo instructions have complete four-language parity',()=>{
 for(const lang of ['fr','en','de','nl']){
  assert.deepEqual(Object.keys(documentPhotoCopy[lang]),Object.keys(documentPhotoCopy.fr));
  for(const text of Object.values(documentPhotoCopy[lang]))assert.ok(text.trim());
 }
});
test('actual photo preparation resizes, re-encodes and keeps PDF intact; invalid and cancelled reads fail',async()=>{
 const original={FileReader:globalThis.FileReader,Image:globalThis.Image,document:globalThis.document};
 let photoWidth=4000,photoHeight=3000,draws=0,canvas;
 globalThis.FileReader=class{readAsDataURL(file){this.result=file.data;queueMicrotask(()=>this.onload?.())}abort(){this.onabort?.()}};
 globalThis.Image=class{naturalWidth=photoWidth;naturalHeight=photoHeight;set src(value){if(value)queueMicrotask(()=>this.onload?.())}};
 globalThis.document={createElement(tag){assert.equal(tag,'canvas');canvas={width:0,height:0,getContext(){return {fillRect(){},drawImage(){draws++}}},toDataURL(type){assert.equal(type,'image/jpeg');return 'data:image/jpeg;base64,REENCODED'}};return canvas;}};
 try{
  const source={type:'image/jpeg',size:8*1024*1024,data:'data:image/jpeg;base64,ORIGINAL_EXIF'};
  assert.equal(await prepareDocument(source),'data:image/jpeg;base64,REENCODED');
  assert.equal(canvas.width,2000);assert.equal(canvas.height,1500);assert.equal(draws,1);assert.match(source.data,/ORIGINAL_EXIF/);
  const pdf={type:'application/pdf',size:100,data:'data:application/pdf;base64,ORIGINALPDF'};
  assert.equal(await prepareDocument(pdf),pdf.data);assert.equal(draws,1);
  photoWidth=10000;photoHeight=10000;await assert.rejects(()=>prepareDocument(source),/document_invalid/);
  await assert.rejects(()=>prepareDocument(source,AbortSignal.abort()),/document_cancelled/);
  globalThis.FileReader=class{readAsDataURL(){}abort(){this.onabort?.()}};
  const ac=new AbortController(),pending=prepareDocument(pdf,ac.signal);ac.abort();await assert.rejects(()=>pending,/document_cancelled/);
 }finally{Object.assign(globalThis,original)}
});
