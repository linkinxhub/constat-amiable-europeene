import test from 'node:test';import assert from 'node:assert/strict';
import {expressEntryAllowed,applyOwnEntry} from '../features/constat/entry-mode-model.ts';
import {entryModeCopy} from '../features/constat/entry-mode-copy.ts';
import {fresh} from '../features/constat/model.ts';
test('express entry opens only for explicit server administrator preview availability',()=>{
 for(const data of [null,{}, {available:true},{available:false,mode:'admin_preview'},{available:true,mode:'premium_closed'},{available:'true',mode:'admin_preview'}])assert.equal(expressEntryAllowed(data),false);
 assert.equal(expressEntryAllowed({available:true,mode:'admin_preview'}),true);
});
test('applying an express result changes only the selected vehicle and preserves common data',()=>{
 const r=fresh();r.place='Lieu';r.vehicles[0].driver='A';r.vehicles[1].driver='B';
 for(const side of [0,1]){const v={...r.vehicles[side],plate:'NEW'};const result=applyOwnEntry(r,side,v);assert.equal(result.vehicles[side],v);assert.equal(result.vehicles[1-side],r.vehicles[1-side]);assert.equal(result.place,r.place);assert.equal(result.photos,r.photos);assert.notEqual(result.vehicles,r.vehicles);}
 assert.equal(r.vehicles[0].plate,'');assert.equal(r.vehicles[1].plate,'');
});
test('entry choices expose identical information in all supported languages',()=>{
 for(const lang of ['fr','en','de','nl']){assert.deepEqual(Object.keys(entryModeCopy[lang]),Object.keys(entryModeCopy.fr));for(const s of Object.values(entryModeCopy[lang]))assert.ok(s.trim());}
});
