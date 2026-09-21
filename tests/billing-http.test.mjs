import test from 'node:test';
import assert from 'node:assert/strict';
import {billingTestConfiguration,readStripeBody} from '../server/billing-http.ts';
const config={BILLING_TEST_ENABLED:'1',STRIPE_TEST_RESTRICTED_KEY:'rk_test_syntheticfixture',STRIPE_TEST_WEBHOOK_SECRET:'whsec_syntheticfixture'};
const headers={'Content-Type':'application/json','Stripe-Signature':'t=1,v1=synthetic'};
test('billing HTTP configuration fails closed unless explicitly enabled with test secrets',()=>{
 assert.equal(billingTestConfiguration(config).apiKey,config.STRIPE_TEST_RESTRICTED_KEY);
 for(const env of [{},{...config,BILLING_TEST_ENABLED:'0'},{...config,BILLING_TEST_ENABLED:'true'},{...config,STRIPE_TEST_RESTRICTED_KEY:'rk_live_synthetic'},{...config,STRIPE_TEST_RESTRICTED_KEY:'sk_test_synthetic'},{...config,STRIPE_TEST_WEBHOOK_SECRET:''}]){
  assert.throws(()=>billingTestConfiguration(env),e=>e.status===503&&!e.message.includes('synthetic'));
 }
});
test('webhook preserves original spacing, unicode and signature header',async()=>{
 const raw=' { "texte": "é € 🚗" }\n';
 const result=await readStripeBody(new Request('https://example.test',{method:'POST',headers,body:raw}));
 assert.equal(result.raw,raw);assert.equal(result.signature,headers['Stripe-Signature']);
});
test('webhook bounds declared and streamed bodies before verification',async()=>{
 for(const req of [new Request('https://example.test',{method:'POST',headers:{...headers,'Content-Length':'262145'},body:'{}'}),new Request('https://example.test',{method:'POST',headers,body:'a'.repeat(262145)})])await assert.rejects(readStripeBody(req),e=>e.status===413);
});
test('missing signature, wrong content type and invalid UTF8 are rejected',async()=>{
 for(const req of [new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),new Request('https://example.test',{method:'POST',headers:{...headers,'Content-Type':'text/plain'},body:'{}'}),new Request('https://example.test',{method:'POST',headers,body:new Uint8Array([0xff])})])await assert.rejects(readStripeBody(req),e=>[400,415].includes(e.status));
});
test('stalled webhook body is cancelled at the deadline',async()=>{
 let cancelled=false;
 const body=new ReadableStream({cancel(){cancelled=true}});
 const req=new Request('https://example.test',{method:'POST',headers,body,duplex:'half'});
 await assert.rejects(readStripeBody(req,10),e=>e.status===408);
 assert.equal(cancelled,true);
});
