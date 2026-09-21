import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFileSync,readdirSync} from 'node:fs';
import {fresh} from '../features/constat/model.ts';import {writeReport,readReport,listReports} from '../server/report-service.ts';
const rootRequire=createRequire(import.meta.url);const wranglerRequire=createRequire(rootRequire.resolve('wrangler/package.json'));const {Miniflare}=wranglerRequire('miniflare');
test('real local D1/R2: migration, round trip, isolation, revision conflict and indexes',async()=>{
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test runtime")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'accordia-storage-test'},r2Buckets:['BUCKET'],cf:false});
 try{
  const db=await mf.getD1Database('DB'),bucket=await mf.getR2Bucket('BUCKET');const stores={db,bucket};
  for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())for(const statement of readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').split('--> statement-breakpoint'))await db.prepare(statement.trim()).run();
  await db.prepare('PRAGMA optimize').run();
  const r={...fresh(),id:'runtime_test_12345678',place:'Synthetic runtime test',photos:[{name:'sample.png',data:'data:image/png;base64,'+readFileSync(new URL('./fixtures/signature-test.png',import.meta.url)).toString('base64')}]};
  const created=await writeReport(stores,'test-owner-a',r.id,{report:r,expectedRevision:0});assert.equal(created.revision,1);
  assert.deepEqual((await readReport(stores,'test-owner-a',r.id)).report.photos,r.photos);
  assert.deepEqual(await listReports(stores,'test-owner-b'),[]);
  await assert.rejects(()=>readReport(stores,'test-owner-b',r.id),e=>e.status===404);
  const next=await writeReport(stores,'test-owner-a',r.id,{report:{...r,place:'Revised'},expectedRevision:1});assert.equal(next.revision,2);
  await assert.rejects(()=>writeReport(stores,'test-owner-a',r.id,{report:r,expectedRevision:1}),e=>e.status===409);
  const history=await db.prepare('SELECT count(*) AS n FROM report_versions WHERE owner_id = ?').bind('test-owner-a').first();assert.equal(history.n,2);
  const storagePlan=await db.prepare('EXPLAIN QUERY PLAN SELECT object_key FROM storage_objects WHERE owner_id=?').bind('test-owner-a').all();assert.ok(storagePlan.results.some(row=>String(row.detail).includes('storage_objects_owner_idx')));
  const plan=await db.prepare('EXPLAIN QUERY PLAN SELECT id FROM reports WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 100').bind('test-owner-a').all();assert.ok(plan.results.some(row=>String(row.detail).includes('reports_owner_updated_idx')));
 }finally{await mf.dispose();}
});
