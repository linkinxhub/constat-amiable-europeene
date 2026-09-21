import test from 'node:test';
import assert from 'node:assert/strict';
import {billingCatalog,parseBillingSelection,validateTestPrice} from '../server/billing-catalog.ts';
const fixture=(sku='report')=>{const c=billingCatalog[sku];return {id:'price_test123',object:'price',active:true,livemode:false,currency:'eur',unit_amount:c.amount,tax_behavior:c.tax,type:c.interval?'recurring':'one_time',billing_scheme:'per_unit',custom_unit_amount:null,transform_quantity:null,recurring:c.interval?{interval:c.interval,interval_count:1,usage_type:'licensed'}:null,metadata:{accordia_sku:sku}}};
test('billing selection rejects browser amounts, roles and provider price IDs',()=>{
  assert.deepEqual(parseBillingSelection({sku:'report',locale:'fr'}),{sku:'report',locale:'fr'});
  for(const extra of [{amount:1},{priceId:'price_cheaper'},{role:'admin'},{paid:true}])assert.throws(()=>parseBillingSelection({sku:'report',locale:'fr',...extra}));
  assert.throws(()=>parseBillingSelection({sku:'free',locale:'fr'}));
});
test('catalog prices use exact cents and billing periods from approved pricing',()=>{
  assert.deepEqual(Object.values(billingCatalog).map(p=>p.amount),[690,1990,490,1900,19000,4900,49000,390]);
  for(const sku of Object.keys(billingCatalog)){
    const value=validateTestPrice(sku,'price_test123',fixture(sku));
    assert.equal(value.mode,billingCatalog[sku].interval?'subscription':'payment');
  }
});
test('test price validation rejects live mode and mismatched commercial terms',()=>{
  for(const patch of [{livemode:true},{active:false},{currency:'usd'},{unit_amount:1},{tax_behavior:'exclusive'},{id:'price_other'},{metadata:{accordia_sku:'personal_extra'}},{billing_scheme:'tiered'},{custom_unit_amount:{enabled:true}},{transform_quantity:{divide_by:10,round:'up'}},{type:'recurring'}]){
    assert.throws(()=>validateTestPrice('report','price_test123',{...fixture(),...patch}));
  }
});
test('annual subscriptions reject monthly, multi-year and metered prices',()=>{
  for(const patch of [{interval:'month'},{interval_count:2},{usage_type:'metered'}]){
    const p=fixture('personal_year');p.recurring={...p.recurring,...patch};
    assert.throws(()=>validateTestPrice('personal_year','price_test123',p));
  }
  assert.throws(()=>validateTestPrice('personal_year','price_test123',{...fixture('personal_year'),recurring:null}));
});
