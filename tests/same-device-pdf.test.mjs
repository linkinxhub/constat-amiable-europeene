import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFDocument} from 'pdf-lib';
import {renderPdf,stampPdf} from '../server/pdf-renderer.ts';
import {pdfFixture} from './pdf-fixture.mjs';
import QRCode from 'qrcode';
test('same-device stamping preserves reviewed bytes and appends signatures without server identity',async()=>{
 const source=await renderPdf({report:pdfFixture(),revision:1,style:'blue-pen',lang:'fr',digest:'Local - no individual authentication',createdAt:'2026-09-21T08:00:00Z',sketch:null});
 const original=source.slice();const data='data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64');
 const signatures=[{data,kind:'drawn',at:'2026-09-21T08:01:00Z',by:'local-A'},{data,kind:'imported',at:'2026-09-21T08:02:00Z',by:'local-B'}];
 const signed=await stampPdf(source,signatures,'fr','a'.repeat(64),'Signatures sur un appareil, sans authentification individuelle.');
 assert.deepEqual(source,original);assert.equal((await PDFDocument.load(signed)).getPageCount(),(await PDFDocument.load(source)).getPageCount()+1);
 assert.ok((await PDFDocument.load(signed)).getPage(0).node.Resources().toString().includes('Image'));
});
test('QR encodes dedicated invitation including fragment locally',async()=>{
 const link='https://example.invalid/session/test#invite=opaque-test-token';const qr=QRCode.create(link,{errorCorrectionLevel:'M'});
 assert.equal(qr.segments.map(s=>new TextDecoder().decode(s.data)).join(''),link);
 assert.match(await QRCode.toDataURL(link),/^data:image\/png;base64,/);
});

test('completion stays independent but resets for changed common facts or own evidence',async()=>{
 const {deviceCompletionKey}=await import('../features/constat/same-device-model.ts');const r=pdfFixture(),a=deviceCompletionKey(r,0),b=deviceCompletionKey(r,1);
 r.vehicles[1].driver='B corrected';assert.equal(deviceCompletionKey(r,0),a);assert.notEqual(deviceCompletionKey(r,1),b);
 r.place='New accident location';assert.notEqual(deviceCompletionKey(r,0),a);
});
