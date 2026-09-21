import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requestOffer} from '../features/constat/offer-request.ts';

test('offer requests require a matching server confirmation',async t=>{
  let received;
  t.mock.method(globalThis,'fetch',async(_url,options)=>{received=options;return Response.json({offer:'personal'})});
  assert.equal(await requestOffer('personal'),'personal');
  assert.equal(received.method,'PUT');
  assert.equal(received.headers['X-Accordia-Request'],'1');
  assert.equal(received.body,JSON.stringify({offer:'personal'}));
  await assert.rejects(requestOffer('fleet'));
});
test('offer reads accept an unset preference but reject invalid responses',async t=>{
  const mock=t.mock.method(globalThis,'fetch',async()=>Response.json({offer:null}));
  assert.equal(await requestOffer(),null);
  for(const value of [{offer:'admin'},{}]){
    mock.mock.mockImplementation(async()=>Response.json(value));
    await assert.rejects(requestOffer());
  }
  mock.mock.mockImplementation(async()=>new Response('',{status:403}));
  await assert.rejects(requestOffer());
});
test('offer timeout aborts a stalled response body and supports a later retry',async t=>{
  const mock=t.mock.method(globalThis,'fetch',async(_url,{signal})=>({ok:true,json:()=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}))}));
  await assert.rejects(requestOffer(undefined,undefined,10),/aborted/);
  mock.mock.mockImplementation(async()=>Response.json({offer:'free'}));
  assert.equal(await requestOffer(),'free');
});
test('leaving the panel cancels its pending load',async t=>{
  t.mock.method(globalThis,'fetch',async(_url,{signal})=>new Promise((_resolve,reject)=>{if(signal.aborted)reject(new Error('aborted'));else signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true})}));
  const controller=new AbortController();const pending=requestOffer(undefined,controller.signal);
  controller.abort();await assert.rejects(pending,/aborted/);
});
