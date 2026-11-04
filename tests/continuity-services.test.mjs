import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {continuityFixture} from './continuity-fixture.mjs';
import {fresh} from '../features/constat/model.ts';
import {profileFromVehicle,applyVehicleProfile} from '../features/constat/vehicle-profile.ts';
import {createProfile,listProfiles,deleteProfile} from '../server/profile-service.ts';
import {writeReport,readReport,listReports} from '../server/report-service.ts';
import {exportReportData,requestReportDeletion} from '../server/report-data-service.ts';
import {createSession} from '../server/session-service.ts';
import {purgeExpired} from '../server/retention-service.ts';
const fails=(fn,status,code)=>assert.rejects(fn,e=>e.status===status&&e.code===code);
test('profile application preserves driver/policyholder, accident facts and filled values unless replacement is explicitly requested',()=>{
 const v=fresh().vehicles[0];Object.assign(v,{driver:'Original driver',policyholder:'Different insured',plate:'KEEP',observations:'Original narrative',damage:'Original damage',standardConfirmed:true});v.extra={driverFirstName:'Original first',impact:'Rear',trailerPlate:'KEEP-TRAILER'};
 const p=profileFromVehicle({...v,plate:'NEW',model:'Truck',insurer:'Insurer',policy:'Policy',extra:{...v.extra,registrationCountry:'BE',trailerPlate:'NEW-TRAILER',licenceNumber:'NEVER'}});
 assert.ok(!('driver' in p));assert.ok(!('policyholder' in p));assert.ok(!('impact' in p.extra));assert.ok(!('licenceNumber' in p.extra));
 const filled=applyVehicleProfile(v,p);assert.equal(filled.plate,'KEEP');assert.equal(filled.extra.trailerPlate,'KEEP-TRAILER');assert.equal(filled.model,'Truck');assert.equal(filled.driver,v.driver);assert.equal(filled.policyholder,v.policyholder);assert.equal(filled.extra.impact,'Rear');assert.equal(filled.standardConfirmed,true);
 const replaced=applyVehicleProfile(v,p,true);assert.equal(replaced.plate,'NEW');assert.equal(replaced.extra.trailerPlate,'NEW-TRAILER');assert.equal(replaced.damage,v.damage);assert.equal(v.model,'');
});
test('real D1 profiles are account-scoped, bounded, refuse forged fields and check suspension',async()=>{
 const f=await continuityFixture();try{const {stores}=f,v={...fresh().vehicles[0],plate:'SYNTHETIC'},input={label:'Synthetic profile',vehicle:profileFromVehicle(v)};
 const p=await createProfile(stores,'owner-a',input);assert.equal((await listProfiles(stores,'owner-a'))[0].id,p.id);assert.deepEqual(await listProfiles(stores,'owner-b'),[]);await fails(()=>deleteProfile(stores,'owner-b',p.id),404,'not_found');
 await fails(()=>createProfile(stores,'owner-a',{...input,owner:'owner-b'}),400,'invalid');await fails(()=>createProfile(stores,'owner-a',{...input,vehicle:{...input.vehicle,driver:'forged'}}),400,'invalid');
 await stores.db.prepare("UPDATE accounts SET status='suspended' WHERE id='owner-a'").run();for(const op of [()=>listProfiles(stores,'owner-a'),()=>createProfile(stores,'owner-a',input),()=>deleteProfile(stores,'owner-a',p.id)])await fails(op,403,'account_unavailable');
 await stores.db.prepare("UPDATE accounts SET status='active',rate_writes=0 WHERE id='owner-a'").run();await deleteProfile(stores,'owner-a',p.id);assert.deepEqual(await listProfiles(stores,'owner-a'),[]);
 for(let i=0;i<19;i++)await stores.db.prepare('INSERT INTO vehicle_profiles(owner_id,id,label,vehicle_json,created_at) VALUES (?,?,?,?,?)').bind('owner-a',crypto.randomUUID(),'Synthetic '+i,JSON.stringify(input.vehicle),new Date().toISOString()).run();
 const results=await Promise.allSettled([createProfile(stores,'owner-a',input),createProfile(stores,'owner-a',input)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await listProfiles(stores,'owner-a')).length,20);
 }finally{await f.dispose()}
});
test('real D1/R2 export retains originals and metadata, deletion fences late writers and cleans only the selected non-shared report',async()=>{
 const f=await continuityFixture();try{const {stores}=f,r={...fresh(),id:'continuity_report_123456',count:'2',place:'Synthetic original',photos:[{name:'original.png',side:'B',data:'data:image/png;base64,'+readFileSync('tests/fixtures/signature-test.png').toString('base64')}],strokes:[[{x:1,y:2},{x:3,y:4}]]};
 await writeReport(stores,'owner-a',r.id,{report:r,expectedRevision:0});await writeReport(stores,'owner-a',r.id,{report:{...r,place:'Synthetic revision'},expectedRevision:1});
 const other={...r,id:'continuity_other_123456'};await writeReport(stores,'owner-a',other.id,{report:other,expectedRevision:0});
 const data=await exportReportData(stores,'owner-a',r.id);assert.deepEqual(data.report.photos,r.photos);assert.deepEqual(data.report.strokes,r.strokes);assert.equal(data.versions.length,2);assert.ok(data.versions.every(v=>!('object_key' in v)));await fails(()=>exportReportData(stores,'owner-b',r.id),404,'not_found');await fails(()=>requestReportDeletion(stores,'owner-b',r.id,{confirm:true,expectedRevision:2}),404,'not_found');await fails(()=>requestReportDeletion(stores,'owner-a',r.id,{confirm:false,expectedRevision:2}),400,'invalid');await fails(()=>requestReportDeletion(stores,'owner-a',r.id,{confirm:true,expectedRevision:1}),409,'conflict');
 const originalPut=stores.bucket.put.bind(stores.bucket);let removed=false;const raceStores={...stores,bucket:{get:stores.bucket.get.bind(stores.bucket),head:stores.bucket.head.bind(stores.bucket),delete:stores.bucket.delete.bind(stores.bucket),put:async(...args)=>{if(!removed){removed=true;const d=await requestReportDeletion(stores,'owner-a',r.id,{confirm:true,expectedRevision:2});assert.equal(d.physicalDeletion,'pending')}return originalPut(...args)}}};
 await fails(()=>writeReport(raceStores,'owner-a',r.id,{report:r,expectedRevision:2}),409,'conflict');assert.equal(removed,true);await fails(()=>readReport(stores,'owner-a',r.id),410,'retention_expired');assert.equal((await listReports(stores,'owner-a')).some(x=>x.id===r.id),false);await fails(()=>createSession(stores,'owner-a',r.id),410,'retention_expired');
 await purgeExpired(stores);assert.equal((await readReport(stores,'owner-a',other.id)).report.place,other.place);await fails(()=>writeReport(stores,'owner-a',r.id,{report:r,expectedRevision:0}),410,'retention_expired');assert.equal((await stores.db.prepare('SELECT count(*) AS n FROM report_versions WHERE report_id=?').bind(r.id).first()).n,0);
 }finally{await f.dispose()}
});
test('shared dossiers and suspended owners cannot request unilateral server deletion',async()=>{
 const f=await continuityFixture();try{const {stores}=f,r={...fresh(),id:'continuity_shared_12345',count:'2'};await writeReport(stores,'owner-a',r.id,{report:r,expectedRevision:0});await createSession(stores,'owner-a',r.id);await fails(()=>requestReportDeletion(stores,'owner-a',r.id,{confirm:true,expectedRevision:1}),409,'shared_session');assert.equal((await listReports(stores,'owner-a'))[0].shared,1);assert.equal((await readReport(stores,'owner-a',r.id)).revision,1);await stores.db.prepare("UPDATE accounts SET status='suspended' WHERE id='owner-a'").run();await fails(()=>requestReportDeletion(stores,'owner-a',r.id,{confirm:true,expectedRevision:1}),403,'account_unavailable');
 }finally{await f.dispose()}
});
