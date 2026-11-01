import test from 'node:test';
import assert from 'node:assert/strict';
import {readJson} from '../server/http.ts';
const request=body=>new Request('https://accordia.test/api/reports/TEST-FICTIF',{method:'POST',body,duplex:'half'});
test('JSON body deadline cancels a stalled stream without waiting for its cancellation promise',async()=>{
 let cancelled=false;
 const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{"test":'))},cancel(){cancelled=true;return new Promise(()=>{})}});
 await assert.rejects(()=>readJson(request(stream),100,10),e=>e.status===408&&e.code==='body_timeout');
 assert.equal(cancelled,true);
});
test('oversize rejection never waits for a slow cancellation callback',async()=>{
 let cancelled=false;
 const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(200))},cancel(){cancelled=true;return new Promise(()=>{})}});
 await assert.rejects(()=>readJson(request(stream),100,100),e=>e.status===413&&e.code==='too_large');assert.equal(cancelled,true);
});
test('JSON bodies reject invalid UTF-8 instead of silently replacing identity characters',async()=>{
 const malformed=new Uint8Array([0x7b,0x22,0x78,0x22,0x3a,0x22,0xff,0x22,0x7d]);
 await assert.rejects(()=>readJson(request(malformed)),e=>e.status===400&&e.code==='invalid');
});
test('valid Unicode, finite completed bodies, empty and malformed JSON preserve their contracts',async()=>{
 const value={name:'TEST FICTIF — Éléonore العربية',count:2};
 assert.deepEqual(await readJson(request(JSON.stringify(value)),500,100),value);
 for(const body of ['', '{oops'])await assert.rejects(()=>readJson(request(body)),e=>e.status===400);
});
