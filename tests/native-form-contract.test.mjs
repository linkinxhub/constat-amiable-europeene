import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {schema} from '../features/constat/model.ts';
import {fieldPresets} from '../features/constat/presets.ts';
import {vehicleKinds} from '../features/constat/vehicle-kind.ts';
import {detailGroups} from '../features/constat/detail-groups.ts';
import {standardCircumstances} from '../features/constat/final-model.ts';
import {extraLabels} from '../features/constat/final-copy.ts';
const asset=JSON.parse(readFileSync(new URL('../mobile/accordia_native/assets/copy/constat.json',import.meta.url),'utf8'));
const spec=asset.formParity;
test('native A/B text field inventory covers the real server vehicle schema',()=>{
 const shape=schema.shape.vehicles.def.items[0].shape;
 assert.deepEqual(spec.fields.slice().sort(),Object.keys(shape).filter(k=>!['kind','extra','circumstances','standardCircumstances','standardConfirmed'].includes(k)).sort());
 const extras=Object.keys(shape.extra.unwrap().shape).sort();
 assert.deepEqual(spec.detailGroups.flat().sort(),extras);
 assert.deepEqual(spec.detailGroups,detailGroups);
});
for(const lang of ['fr','en','de','nl'])test(`native choices and labels equal website sources: ${lang}`,()=>{
 assert.deepEqual(asset.extraLabels[lang],extraLabels[lang]);
 assert.deepEqual(asset.standardCircumstances[lang],standardCircumstances[lang]);
 for(const kind of vehicleKinds)for(const field of [...spec.fields,...spec.detailGroups.flat()])assert.deepEqual(spec.presets[lang][kind][field],fieldPresets(field,lang,kind));
});
