import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,schema} from '../features/constat/model.ts';
import {selectParticipation,participationModes} from '../features/constat/participation-model.ts';
import {onboardingCopy} from '../features/constat/onboarding-copy.ts';
import {questionnairePages} from '../features/constat/questionnaire-model.ts';

test('solo participation preserves two vehicles, the selected role, photos and original data',()=>{
 const r=fresh();r.count='2';r.vehicles[1].driver='Driver B';r.vehicles[1].observations='Original statement';r.readingLanguages=['fr','nl'];r.start={ownerSide:'B',photoOwner:'B',autoSketch:true};r.photos=[{name:'original',side:'B',data:'data:image/png;base64,AAAA'}];
 const before=JSON.stringify(r),next=selectParticipation(r,'solo');
 assert.equal(next.count,'2');assert.deepEqual(next.vehicles,r.vehicles);assert.deepEqual(next.photos,r.photos);assert.deepEqual(next.readingLanguages,['fr','nl']);assert.equal(next.start.ownerSide,'B');assert.equal(next.start.photoOwner,'B');assert.equal(next.start.autoSketch,true);assert.equal(JSON.stringify(r),before);assert.ok(schema.safeParse(next).success);
});
test('switching modes and saving/parsing keeps hidden vehicle B data without inventing agreement',()=>{
 let r=fresh();r.count='1';r.vehicles[1].driver='Saved B';
 for(const mode of participationModes){r=schema.parse(selectParticipation(r,mode));assert.equal(r.start.participationMode,mode);assert.equal(r.vehicles[1].driver,'Saved B');assert.equal(r.count,'2');assert.equal('signature' in r,false);assert.equal(r.injured,'');}
 const solo=selectParticipation(fresh(),'solo');assert.equal(solo.count,'');assert.equal(solo.start.ownerSide,'A');assert.ok(schema.safeParse(solo).success);
});
test('old drafts stay compatible and forged device modes are rejected',()=>{
 assert.ok(schema.safeParse(fresh()).success);
 assert.equal(schema.safeParse({...fresh(),start:{ownerSide:'A',photoOwner:'both',autoSketch:false,participationMode:'admin'}}).success,false);
 const old={...fresh(),start:{ownerSide:'B',photoOwner:'both',autoSketch:false}};assert.ok(schema.safeParse(old).success);
});
test('same-device A can complete common facts, B stays in their own questionnaire',()=>{
 const a=questionnairePages('2',0,true),b=questionnairePages('2',1,false);
 assert.ok(a.some(p=>p.kind==='safety'));assert.ok(a.some(p=>p.kind==='time'));assert.ok(a.some(p=>p.kind==='place'));assert.ok(!b.some(p=>p.kind==='safety'));assert.ok(b.every(p=>p.side===1));
});
test('safety instructions and modes are complete in four languages',()=>{
 for(const lang of ['fr','en','de','nl']){assert.deepEqual(Object.keys(onboardingCopy[lang]),Object.keys(onboardingCopy.fr));for(const value of Object.values(onboardingCopy[lang]))assert.ok(value.trim());assert.ok(onboardingCopy[lang].emergency.includes('112'));assert.ok(onboardingCopy[lang].guide.includes(onboardingCopy[lang].safe));}
});
