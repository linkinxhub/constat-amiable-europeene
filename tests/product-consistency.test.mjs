import test from 'node:test';import assert from 'node:assert/strict';
import {billingCatalog} from '../server/billing-catalog.ts';
import {pricingCopy} from '../features/constat/pricing-copy.ts';
import {documentCopy} from '../features/constat/document-copy.ts';
import {documentKinds,kindFields,documentFields,applyDocumentFields} from '../features/constat/document-model.ts';
import {fresh,schema} from '../features/constat/model.ts';
import {extraLabels} from '../features/constat/final-copy.ts';
import {dictionaries} from '../features/constat/i18n.ts';
test('every public language advertises the server catalogue prices',()=>{
 for(const lang of ['fr','en','de','nl']){
 const plans=pricingCopy[lang].plans;
 const cents=s=>Math.round(Number(s.replace(/[^0-9,.]/g,'').replace(',','.'))*100);
 assert.equal(cents(plans[1].price),billingCatalog.report.amount);assert.equal(cents(plans[2].price),billingCatalog.personal_year.amount);
 assert.equal(cents(plans[3].price),billingCatalog.fleet_start_month.amount);assert.equal(cents(plans[4].price),billingCatalog.fleet_pro_month.amount);
 assert.equal(plans.length,6);
 }
});
test('document types and every extracted field are localized and accepted by the report schema',()=>{
 for(const lang of ['fr','en','de','nl']){assert.equal(documentCopy[lang].kinds.length,documentKinds.length);for(const key of documentFields)assert.ok(dictionaries[lang][key]||extraLabels[lang][key],lang+':'+key)}
 const r=fresh();r.vehicles[0]=applyDocumentFields(r.vehicles[0],r.vehicles[0],documentFields.map(field=>({field,value:'synthetic',confidence:'high'})));assert.equal(schema.safeParse(r).success,true);
 for(const kind of documentKinds)for(const field of kindFields[kind])assert.ok(documentFields.includes(field));
 assert.deepEqual(kindFields.trailer,['trailerPlate','trailerCountry']);assert.ok(kindFields.policyholder_identity.every(x=>x.startsWith('policyholder')));
});
