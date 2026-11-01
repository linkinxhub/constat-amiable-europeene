import {z} from 'zod';

import {billingCatalog} from '../features/product/catalog.ts';
export {billingCatalog} from '../features/product/catalog.ts';
export type BillingSku=keyof typeof billingCatalog;
const sku=z.enum(['report','personal_year','personal_extra','fleet_start_month','fleet_start_year','fleet_pro_month','fleet_pro_year','fleet_extra']);

// Never accept a client-supplied amount, Stripe price ID, role or entitlement.
export function parseBillingSelection(input:unknown){
  return z.object({sku,locale:z.enum(['fr','en','de','nl'])}).strict().parse(input);
}

const stripePrice=z.object({
  id:z.string().regex(/^price_[a-zA-Z0-9]+$/),object:z.literal('price'),
  active:z.literal(true),livemode:z.literal(false),currency:z.literal('eur'),
  unit_amount:z.number().int().positive(),tax_behavior:z.enum(['inclusive','exclusive']),
  type:z.enum(['one_time','recurring']),billing_scheme:z.literal('per_unit'),
  custom_unit_amount:z.null(),transform_quantity:z.null(),
  recurring:z.object({interval:z.enum(['month','year']),interval_count:z.literal(1),usage_type:z.literal('licensed')}).nullable(),
  metadata:z.object({accordia_sku:sku}),
});

// Input must come from an authenticated server-to-Stripe retrieval, never the browser.
// Test-only by design. A successful price check is NOT proof of payment.
export function validateTestPrice(selection:BillingSku,expectedPriceId:string,input:unknown){
  const price=stripePrice.parse(input),expected=billingCatalog[selection];
  if(price.id!==expectedPriceId||price.metadata.accordia_sku!==selection||
    price.unit_amount!==expected.amount||price.tax_behavior!==expected.tax||
    price.type!==(expected.interval?'recurring':'one_time')||
    (price.recurring?.interval??null)!==expected.interval){
    throw new Error('billing_price_mismatch');
  }
  return Object.freeze({priceId:price.id,sku:selection,mode:expected.interval?'subscription' as const:'payment' as const});
}
