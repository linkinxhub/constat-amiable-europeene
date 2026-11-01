import test from 'node:test';
import assert from 'node:assert/strict';
import {detailGroups} from '../features/constat/detail-groups.ts';
import {extraFields} from '../features/constat/final-model.ts';
import {simpleCopy} from '../features/constat/simple-copy.ts';
test('progressive vehicle sections retain every existing field exactly once',()=>{
 assert.deepEqual([...detailGroups.flat()].sort(),[...extraFields].sort());
 assert.equal(new Set(detailGroups.flat()).size,extraFields.length);
});
test('each language explains every section and each existing step',()=>{
 for(const lang of ['fr','en','de','nl']){
  const c=simpleCopy[lang];assert.equal(c.groups.length,detailGroups.length);assert.equal(c.steps.length,5);
  for(const value of Object.values(c)) for(const text of Array.isArray(value)?value:[value]) assert.ok(text.trim());
 }
});
