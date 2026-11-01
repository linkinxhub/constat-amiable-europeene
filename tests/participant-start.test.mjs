import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {fresh} from '../features/constat/model.ts';
import {writeReport} from '../server/report-service.ts';
import {createSession,joinSession,readSession,updateSession,renewInvite,listSessions} from '../server/session-service.ts';
import {sketchAction,sketchState} from '../server/sketch-service.ts';
import {participantHash} from '../server/participant-progress.ts';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const photo={side:'B',name:'synthetic.png',data:'data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64')};
const config={OPENAI_API_KEY:'synthetic',OPENAI_SKETCH_MODEL:'synthetic'};
async function fixture(fn){const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'participant-start'},r2Buckets:['BUCKET'],cf:false});try{const stores={db:await mf.getD1Database('DB'),bucket:await mf.getR2Bucket('BUCKET')};for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8').split('--> statement-breakpoint'))if(sql.trim())await stores.db.prepare(sql.trim()).run();const report={...fresh(),id:'participant_start_123',count:'2',injured:'no',start:{ownerSide:'B',photoOwner:'B',autoSketch:true},readingLanguages:['fr','de'],photos:[photo]};await writeReport(stores,'creator',report.id,{report,expectedRevision:0});const session=await createSession(stores,'creator',report.id);await fn(stores,report,session)}finally{await mf.dispose()}}
test('creator B invites A; immutable roles, isolated languages/sections, common facts and photo assignment',()=>fixture(async(stores,r,s)=>{
 const renew=await renewInvite(stores,'creator',s.id);await assert.rejects(joinSession(stores,'guest',s.id,s.token),e=>e.code==='invite_invalid');await joinSession(stores,'guest',s.id,renew.token);
 const b=await readSession(stores,'creator',s.id),a=await readSession(stores,'guest',s.id);assert.equal(b.side,'B');assert.equal(a.side,'A');assert.equal(b.isOwner,true);assert.equal(a.isOwner,false);assert.equal((await listSessions(stores,'creator'))[0].side,'B');assert.equal((await listSessions(stores,'guest'))[0].side,'A');await assert.rejects(renewInvite(stores,'guest',s.id),e=>e.code==='forbidden');
 const forged=structuredClone(r);forged.start={ownerSide:'A',photoOwner:'both',autoSketch:false};forged.vehicles[0].driver='A legitimate';forged.vehicles[1].driver='forged B';forged.readingLanguages=['nl','en'];forged.place='Shared facts from A';
 const saved=await updateSession(stores,'guest',s.id,{report:forged,expectedRevision:1});assert.equal(saved.report.vehicles[0].driver,'A legitimate');assert.equal(saved.report.vehicles[1].driver,'');assert.deepEqual(saved.report.readingLanguages,['nl','de']);assert.deepEqual(saved.report.start,r.start);assert.equal(saved.report.place,'Shared facts from A');
 const bad={...saved.report,photos:[...saved.report.photos,{...photo,side:'A'}]};await assert.rejects(updateSession(stores,'guest',s.id,{report:bad,expectedRevision:2}),e=>e.code==='photo_assigned');
 await assert.rejects(updateSession(stores,'creator',s.id,{report:r,expectedRevision:1}),e=>e.code==='conflict');
 const input=structuredClone(saved.report);input.vehicles[1].driver='B legitimate';input.vehicles[0].driver='forged A';input.place='forged common';input.readingLanguages=['en','en'];
 const merged=await updateSession(stores,'creator',s.id,{report:input,expectedRevision:2});assert.equal(merged.report.vehicles[0].driver,'A legitimate');assert.equal(merged.report.vehicles[1].driver,'B legitimate');assert.equal(merged.report.place,'Shared facts from A');assert.deepEqual(merged.report.readingLanguages,['nl','en']);
 await sketchAction(stores,'creator',s.id,{action:'consent',revision:3},{});assert.equal((await sketchState(stores,'guest',s.id,{})).consents.consent_b,3);
}));
async function ready(stores,r,s){await joinSession(stores,'guest',s.id,s.token);r=(await readSession(stores,'creator',s.id)).report;for(const side of ['A','B']){const stamp=JSON.stringify({hash:await participantHash(r,side),at:new Date().toISOString()});await stores.db.prepare(`UPDATE shared_sessions SET done_${side.toLowerCase()}=? WHERE id=?`).bind(stamp,s.id).run()}for(const actor of ['creator','guest'])await sketchAction(stores,actor,s.id,{action:'consent',revision:1},{})}
test('automatic sketch requires both completions/consents and is at most once per revision, including reload',()=>fixture(async(stores,r,s)=>{
 let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({roads:[],vehicles:[],uncertainties:['Synthetic evidence']})}]}]}))};try{
 await assert.rejects(sketchAction(stores,'creator',s.id,{action:'auto',revision:1},config),e=>e.code==='incomplete');assert.equal(calls,0);await ready(stores,r,s);await assert.rejects(sketchAction(stores,'guest',s.id,{action:'auto',revision:1},config),e=>e.code==='forbidden');
 await stores.db.prepare('UPDATE shared_sessions SET consent_a=0 WHERE id=?').bind(s.id).run();await assert.rejects(sketchAction(stores,'creator',s.id,{action:'auto',revision:1},config),e=>e.code==='consent_required');assert.equal(calls,0);await sketchAction(stores,'guest',s.id,{action:'consent',revision:1},{});
 await sketchAction(stores,'creator',s.id,{action:'auto',revision:1},config);await sketchAction(stores,'creator',s.id,{action:'auto',revision:1},config);assert.equal(calls,1);const state=await sketchState(stores,'guest',s.id,config);assert.equal(state.consents.auto_sketch_revision,1);assert.equal(state.proposal.approvedA,false);assert.equal(state.proposal.approvedB,false);
 }finally{globalThis.fetch=old}
}));
test('failed automatic provider response is not retried automatically; manual retry remains possible',()=>fixture(async(stores,r,s)=>{
 await ready(stores,r,s);let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;return new Response('',{status:503})};try{await assert.rejects(sketchAction(stores,'creator',s.id,{action:'auto',revision:1},config),e=>e.code==='ai_unavailable');await sketchAction(stores,'creator',s.id,{action:'auto',revision:1},config);assert.equal(calls,1);await assert.rejects(sketchAction(stores,'creator',s.id,{action:'generate',revision:1},config),e=>e.code==='ai_unavailable');assert.equal(calls,2)}finally{globalThis.fetch=old}
}));
test('concurrent report edit cannot bind a session to stale role choices',()=>fixture(async(stores,r)=>{
 const other={...r,id:'concurrent_start_12345'};await writeReport(stores,'creator',other.id,{report:other,expectedRevision:0});
 const racing={...stores,db:{prepare(query){const stmt=stores.db.prepare(query);if(!query.startsWith('INSERT INTO shared_sessions'))return stmt;return {bind(...args){const bound=stmt.bind(...args);return {async run(){await stores.db.prepare('UPDATE reports SET revision=revision+1 WHERE owner_id=? AND id=?').bind('creator',other.id).run();return bound.run()}}}}}}};
 await assert.rejects(createSession(racing,'creator',other.id),e=>e.code==='conflict');assert.equal(await stores.db.prepare('SELECT id FROM shared_sessions WHERE report_id=?').bind(other.id).first(),null);
}));
test('invite renewal fails if the guest joins between authorization and update',()=>fixture(async(stores,r,s)=>{
 const racing={...stores,db:{prepare(query){const stmt=stores.db.prepare(query);if(!query.startsWith('UPDATE shared_sessions SET invite_hash = ?'))return stmt;return {bind(...args){const bound=stmt.bind(...args);return {async run(){await stores.db.prepare('UPDATE shared_sessions SET participant_b=? WHERE id=?').bind('guest',s.id).run();return bound.run()}}}}}}};
 await assert.rejects(renewInvite(racing,'creator',s.id),e=>e.code==='conflict');
}));
