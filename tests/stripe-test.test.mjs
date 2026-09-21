import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,randomUUID} from 'node:crypto';
import {testStripeClient,createTestCheckout,verifyTestCheckoutEvent} from '../server/stripe-test.ts';
import config from '../server/billing-test-prices.json' with {type:'json'};
const order={id:randomUUID(),sku:'report',locale:'fr'};
const key='rk_test_'+ 'syntheticfixture';
const secret='whsec_'+randomUUID();
const client=testStripeClient(key);
const session={id:'cs_test_fixture',object:'checkout.session',livemode:false,mode:'payment',status:'complete',payment_status:'paid',currency:'eur',amount_total:690,client_reference_id:order.id,metadata:{accordia_order:order.id,accordia_sku:'report'}};
const event=(patch={})=>({id:'evt_fixture',object:'event',livemode:false,type:'checkout.session.completed',data:{object:{...session,...patch}}});
function sign(raw,time=Math.floor(Date.now()/1000)){
 return `t=${time},v1=${createHmac('sha256',secret).update(`${time}.${raw}`).digest('hex')}`;
}
test('Stripe adapter refuses live or unrestricted keys',()=>{
 for(const key of ['', 'rk_live_fixture','sk_test_fixture'])assert.throws(()=>testStripeClient(key));
});
test('Checkout uses server price, fixed destinations and stable order idempotency',async()=>{
 let captured;
 const fake={accounts:{retrieve:async()=>({id:config.account})},prices:{retrieve:async()=>({id:config.prices.report,object:'price',active:true,livemode:false,currency:'eur',unit_amount:690,tax_behavior:'inclusive',type:'one_time',billing_scheme:'per_unit',custom_unit_amount:null,transform_quantity:null,recurring:null,metadata:{accordia_sku:'report'}})},checkout:{sessions:{create:async(...args)=>{captured=args;return {id:'cs_test_fixture',livemode:false,url:'https://checkout.stripe.com/c/pay/test'}}}}};
 await createTestCheckout(fake,order);
 assert.equal(captured[0].line_items[0].price,config.prices.report);
 assert.equal(captured[0].line_items[0].quantity,1);
 assert.equal(captured[1].idempotencyKey,'accordia:test:checkout:'+order.id);
 assert.equal('payment_method_types' in captured[0],false);
 assert.equal(captured[0].success_url,'https://accordia-constat.adil-btp.chatgpt.site/account?lang=fr');
 await assert.rejects(createTestCheckout(fake,{...order,sku:'fleet_extra'}));
 await assert.rejects(createTestCheckout(fake,{...order,amount:1}));
 fake.accounts.retrieve=async()=>({id:'acct_wrong'});
 await assert.rejects(createTestCheckout(fake,order),/account_mismatch/);
});
test('Stripe SDK verifies genuine HMAC over the exact body',async()=>{
 const raw=JSON.stringify(event());
 assert.deepEqual(await verifyTestCheckoutEvent(client,raw,sign(raw),secret),{eventId:'evt_fixture',sessionId:session.id,orderId:order.id});
 await assert.rejects(verifyTestCheckoutEvent(client,raw+' ',sign(raw),secret));
 await assert.rejects(verifyTestCheckoutEvent(client,raw,sign(raw,Math.floor(Date.now()/1000)-600),secret));
 await assert.rejects(verifyTestCheckoutEvent(client,raw,'',secret));
});
test('signed events cannot confirm wrong amount, currency, order or real payment',async()=>{
 for(const patch of [{amount_total:1},{currency:'usd'},{client_reference_id:randomUUID()},{livemode:true},{mode:'subscription'},{status:'open'}]){
  const raw=JSON.stringify(event(patch));await assert.rejects(verifyTestCheckoutEvent(client,raw,sign(raw),secret));
 }
 for(const patch of [{livemode:true},{account:config.account}]){
  const raw=JSON.stringify({...event(),...patch});await assert.rejects(verifyTestCheckoutEvent(client,raw,sign(raw),secret));
 }
});
test('unpaid completion and unrelated products do not confirm an order',async()=>{
 for(const patch of [{payment_status:'unpaid'},{metadata:{app:'another_project'}}]){
  const raw=JSON.stringify(event(patch));assert.equal(await verifyTestCheckoutEvent(client,raw,sign(raw),secret),null);
 }
 const raw=JSON.stringify({...event(),type:'checkout.session.async_payment_succeeded'});
 assert.equal((await verifyTestCheckoutEvent(client,raw,sign(raw),secret)).orderId,order.id);
});
