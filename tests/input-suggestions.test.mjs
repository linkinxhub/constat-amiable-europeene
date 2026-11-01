import test from 'node:test';import assert from 'node:assert/strict';
import {vehicleBrands} from '../features/constat/vehicle-brands.ts';
import {fieldPresets} from '../features/constat/presets.ts';
import {damageSuggestions,appendDamage} from '../features/constat/damage-suggestions.ts';
import {fresh,schema} from '../features/constat/model.ts';
test('expanded make suggestions retain old makes and do not constrain saved make/model',()=>{
 for(const make of ['Audi','BMW','Citroën','Dacia','DAF','Fiat','Ford','Iveco','MAN','Mercedes-Benz','Opel','Peugeot','Renault','Scania','Škoda','Toyota','Volkswagen','Volvo'])assert.ok(vehicleBrands.includes(make));
 assert.ok(vehicleBrands.length>100);assert.equal(new Set(vehicleBrands).size,vehicleBrands.length);
 const r=fresh();r.vehicles[0].model='Marque hors liste — Modèle personnel';assert.equal(schema.parse(r).vehicles[0].model,r.vehicles[0].model);
 for(const lang of ['fr','en','de','nl']){assert.deepEqual(fieldPresets('model',lang).map(p=>p.value),vehicleBrands);assert.ok(fieldPresets('insurer',lang).length>10);assert.equal(fieldPresets('policy',lang).length,0);assert.equal(fieldPresets('driver',lang).length,0);}
});
test('damage additions preserve personal text, support several choices and reject duplicates or overflow',()=>{
 const text='Texte original\n';const once=appendDamage(text,'Rayures');assert.equal(once,text+'\nRayures');
 assert.equal(appendDamage(once,'Rayures'),once);assert.equal(appendDamage(once,'Pare-chocs avant'),once+'\nPare-chocs avant');
 assert.equal(appendDamage('x'.repeat(4000),'Rayures'),'x'.repeat(4000));
 assert.equal(appendDamage('', 'Rayures'),'Rayures');
 for(const lang of ['fr','en','de','nl']){assert.equal(damageSuggestions[lang].length,20);assert.equal(new Set(damageSuggestions[lang]).size,20);}
});
