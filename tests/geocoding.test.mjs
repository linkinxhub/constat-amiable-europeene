import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAddress,mergeAddress,fullPlace,lookupAddress} from '../features/constat/geocoding.ts';
import {fresh,schema} from '../features/constat/model.ts';

test('address includes named place, street and separate city; missing data is not invented',()=>{
 assert.deepEqual(parseAddress({features:[{properties:{name:'Parking Nord',street:'Rue Exemple',housenumber:'12',city:'Ville Test'}}]}),{place:'Parking Nord · Rue Exemple 12',city:'Ville Test'});
 assert.deepEqual(parseAddress({features:[{properties:{name:'Village Test',village:'Village Test'}}]}),{place:'',city:'Village Test'});
 assert.throws(()=>parseAddress({features:[]}));
 assert.deepEqual(parseAddress({features:[{properties:{street:'Route Exemple'}}]}),{place:'Route Exemple',city:''});
});
test('delayed address preserves newer edits and cannot update another GPS reading',()=>{
 const r={...fresh(),location:{latitude:0,longitude:0,accuracy:10,capturedAt:'2026-09-21T01:00:00.000Z'}};
 const address={place:'Rue Exemple',city:'Ville Test'},before={place:'',city:''};
 const applied=mergeAddress(r,address,r.location.capturedAt,before);
 assert.equal(fullPlace(applied),'Rue Exemple · Ville Test');
 assert.equal(mergeAddress({...r,place:'Correction'},address,r.location.capturedAt,before).place,'Correction');
 assert.equal(mergeAddress(r,address,'old',before),r);
 assert.equal(schema.parse(applied).city,'Ville Test');
 assert.equal(schema.parse(fresh()).city,undefined);
});
test('lookup validates coordinates before any request',async()=>{
 await assert.rejects(lookupAddress(NaN,0,'fr',new AbortController().signal),/invalid_coordinates/);
 await assert.rejects(lookupAddress(91,0,'fr',new AbortController().signal),/invalid_coordinates/);
});
test('GPS country maps supported ISO codes and preserves manual corrections',()=>{
 for(const code of ['BE','FR','DE','NL','ES','IT']){
  const address=parseAddress({features:[{properties:{street:'Route',city:'Commune',countrycode:code.toLowerCase()}}]});
  assert.equal(address.country,code==='IT'?'OTHER':code);
 }
 const r={...fresh(),country:'BE',location:{latitude:1,longitude:2,accuracy:10,capturedAt:'2026-10-23T01:00:00.000Z'}};
 const before={place:r.place,city:r.city||'',country:'BE'};
 assert.equal(mergeAddress(r,{place:'Rue',city:'Paris',country:'FR'},r.location.capturedAt,before).country,'FR');
 assert.equal(mergeAddress({...r,country:'DE'},{place:'Rue',city:'Paris',country:'FR'},r.location.capturedAt,before).country,'DE');
 assert.equal(mergeAddress(r,{place:'Rue',city:'Paris'},r.location.capturedAt,before).country,'BE');
});
