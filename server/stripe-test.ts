import Stripe from 'stripe';
import {z} from 'zod';
import prices from './billing-test-prices.json' with {type:'json'};
import {validateTestPrice,billingCatalog} from './billing-catalog.ts';

const origin='https://accordia-constat.adil-btp.chatgpt.site';
const orderSchema=z.object({id:z.string().uuid(),sku:z.literal('report'),locale:z.enum(['fr','en','de','nl'])}).strict();
export type TestOrder=z.infer<typeof orderSchema>;

export function testStripeClient(apiKey:string){
  if(!/^rk_test_[A-Za-z0-9]+$/.test(apiKey))throw new Error('stripe_test_key_required');
  return new Stripe(apiKey,{httpClient:Stripe.createFetchHttpClient(),timeout:15000,maxNetworkRetries:1});
}

// This adapter must only receive a persisted, server-authorized order.
// Not exposed as a route until owner checks, order storage and fulfillment exist.
export async function createTestCheckout(client:Stripe,input:TestOrder){
  const order=orderSchema.parse(input);
  const account=await client.accounts.retrieve(prices.account);
  if(account.id!==prices.account)throw new Error('stripe_account_mismatch');
  const priceId=prices.prices.report;
  validateTestPrice(order.sku,priceId,await client.prices.retrieve(priceId));
  const session=await client.checkout.sessions.create({
    mode:'payment',line_items:[{price:priceId,quantity:1}],locale:order.locale,
    client_reference_id:order.id,metadata:{accordia_order:order.id,accordia_sku:order.sku},
    success_url:origin+'/account?lang='+order.locale,
    cancel_url:origin+'/pricing?lang='+order.locale,
    integration_identifier:'accordia_test_qmrtksva',
  },{idempotencyKey:'accordia:test:checkout:'+order.id});
  const url=session.url?new URL(session.url):null;
  if(session.livemode!==false||!session.id.startsWith('cs_test_')||
    !url||url.origin!=='https://checkout.stripe.com'||url.username||url.password){
    throw new Error('stripe_session_invalid');
  }
  return {id:session.id,url:url.href};
}

const paidSession=z.object({
  id:z.string().regex(/^cs_test_[A-Za-z0-9]+$/),object:z.literal('checkout.session'),
  livemode:z.literal(false),mode:z.literal('payment'),status:z.literal('complete'),
  payment_status:z.literal('paid'),currency:z.literal('eur'),amount_total:z.literal(billingCatalog.report.amount),
  client_reference_id:z.string().uuid(),metadata:z.object({accordia_order:z.string().uuid(),accordia_sku:z.literal('report')}),
});

// Verification only: no rights are granted here. The caller must reconcile the
// persisted order, session ID and event ID in one idempotent database transaction.
export async function verifyTestCheckoutEvent(client:Stripe,raw:string,signature:string,secret:string){
  if(!secret.startsWith('whsec_'))throw new Error('stripe_webhook_unconfigured');
  if(new TextEncoder().encode(raw).byteLength>262144)throw new Error('stripe_event_too_large');
  const event=await client.webhooks.constructEventAsync(raw,signature,secret,300,Stripe.createSubtleCryptoProvider());
  if(event.livemode!==false||event.account)throw new Error('stripe_event_wrong_context');
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return null;
  const object=event.data.object as Stripe.Checkout.Session;
  if(object.metadata?.accordia_sku!=='report')return null;
  // Completion can precede payment for asynchronous methods.
  if(object.payment_status!=='paid')return null;
  const session=paidSession.parse(object);
  if(session.client_reference_id!==session.metadata.accordia_order)throw new Error('stripe_order_mismatch');
  return {eventId:event.id,sessionId:session.id,orderId:session.client_reference_id};
}
