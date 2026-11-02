import test from 'node:test';
import assert from 'node:assert/strict';
import {saveQueue} from '../features/constat/save-queue.ts';
import {providerText} from '../server/provider-response.ts';
test('autosave queue serializes snapshots and recovers after storage failure',async()=>{
 const written=[];let release;const first=new Promise(r=>release=r);const save=saveQueue(async value=>{if(value===1)await first;if(value===2)throw new Error('quota');written.push(value);return value});
 const a=save(1),b=save(2),c=save(3);const rejected=assert.rejects(b,/quota/);await Promise.resolve();assert.deepEqual(written,[]);release();await a;await rejected;assert.equal(await c,3);assert.deepEqual(written,[1,3]);
});
test('provider reader cancels redirects and oversized streams before parsing',async()=>{
 let cancelled=false;const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(11))},cancel(){cancelled=true}});await assert.rejects(providerText(new Response(stream),10,'ai_unavailable'),e=>e.code==='ai_unavailable');assert.equal(cancelled,true);
 await assert.rejects(providerText(new Response('',{status:302,headers:{Location:'https://example.invalid'}}),10,'ai_unavailable'),e=>e.code==='ai_unavailable');assert.equal(await providerText(new Response('ok'),10,'ai_unavailable'),'ok');
});
