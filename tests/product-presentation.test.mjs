import test from 'node:test';
import assert from 'node:assert/strict';
import {offerOptions} from '../features/product/offer-options.ts';
import {presentationCopy,publicLanguage} from '../features/product/presentation-copy.ts';
import {pricingCopy} from '../features/constat/pricing-copy.ts';
import {offerIds} from '../features/constat/offer-model.ts';
import {billingCatalog} from '../server/billing-catalog.ts';
test('account preferences keep actual catalogue prices and never manufacture fleet tiers or payment rights',()=>{
 for(const lang of ['fr','en','de','nl']){
  const choices=offerOptions(lang);assert.deepEqual(choices.map(p=>p.id),offerIds);
  const amount=s=>Math.round(Number(s.replace(/[^0-9,.]/g,'').replace(',','.'))*100);
  assert.equal(amount(choices[0].price),0);assert.equal(amount(choices[1].price),billingCatalog.report.amount);assert.equal(amount(choices[2].price),billingCatalog.personal_year.amount);assert.equal(amount(choices[3].price),billingCatalog.fleet_start_month.amount);
  assert.equal(choices[0].status,presentationCopy[lang].available);
  assert.equal(choices[1].status,pricingCopy[lang].planned);assert.equal(choices[3].status,pricingCopy[lang].fleetStatus);
  assert.equal(choices.filter(p=>p.id==='fleet').length,1);assert.ok(!choices.some(p=>'entitlements' in p||'checkout' in p));
 }
});
test('public language routing accepts only four languages and all shared navigation/guide labels exist',()=>{
 for(const lang of ['fr','en','de','nl']){assert.equal(publicLanguage(lang),lang);assert.deepEqual(Object.keys(presentationCopy[lang]),Object.keys(presentationCopy.fr));assert.notEqual(presentationCopy[lang].navigation,presentationCopy[lang].footerNavigation);for(const text of Object.values(presentationCopy[lang]))assert.ok(text.trim());assert.ok(pricingCopy[lang].guide.includes(presentationCopy[lang].guide));}
 for(const invalid of ['__proto__','constructor','FR','es','',undefined,null,{},['fr']])assert.equal(publicLanguage(invalid),undefined);
});
