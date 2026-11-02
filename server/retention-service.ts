import {ReportError,type Stores} from './report-service.ts';
export async function checkRetention(stores:Stores,owner:string,id:string){const row=await stores.db.prepare('SELECT retention_until FROM reports WHERE owner_id=? AND id=?').bind(owner,id).first<{retention_until:number}>();if(row?.retention_until&&row.retention_until<=Date.now())throw new ReportError(410,'retention_expired');}
// Bounded, resumable cleanup. References are removed atomically only after all keys
// have been queued; failed R2 deletes leave the queue intact for the next run.
export async function purgeExpired(stores:Stores,now=Date.now()){
 const due=await stores.db.prepare('SELECT owner_id,id FROM reports WHERE retention_until>0 AND retention_until<=? ORDER BY retention_until LIMIT 5').bind(now).all<{owner_id:string,id:string}>();
 for(const r of due.results){const o=r.owner_id,id=r.id;
 const refs=`WITH sessions AS (SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?), docs AS (SELECT * FROM final_documents WHERE session_id IN (SELECT id FROM sessions)), refs(k) AS (SELECT object_key FROM reports WHERE owner_id=? AND id=? UNION SELECT object_key FROM report_versions WHERE owner_id=? AND report_id=? UNION SELECT object_key FROM sketch_proposals WHERE session_id IN (SELECT id FROM sessions) UNION SELECT j.value FROM docs d,json_each(json_array(d.preview_key,d.report_key,d.sketch_key,d.signature_a,d.signature_b,d.pdf_key)) j) SELECT k,?,? FROM refs WHERE k IS NOT NULL AND k!=''`;
 await stores.db.batch([
 stores.db.prepare('INSERT INTO retention_jobs(owner_id,report_id) VALUES (?,?) ON CONFLICT DO NOTHING').bind(o,id),
 stores.db.prepare('INSERT INTO retention_objects(object_key,owner_id,report_id) '+refs+' ON CONFLICT DO NOTHING').bind(o,id,o,id,o,id,o,id),
 stores.db.prepare("UPDATE storage_objects SET state='cleanup' WHERE object_key IN (SELECT object_key FROM retention_objects WHERE owner_id=? AND report_id=?)").bind(o,id),
 stores.db.prepare('DELETE FROM final_documents WHERE session_id IN (SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?)').bind(o,id),
 stores.db.prepare('DELETE FROM sketch_proposals WHERE session_id IN (SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?)').bind(o,id),
 stores.db.prepare('DELETE FROM synthesis_proposals WHERE session_id IN (SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?)').bind(o,id),
 stores.db.prepare('DELETE FROM shared_sessions WHERE owner_id=? AND report_id=?').bind(o,id),
 stores.db.prepare('DELETE FROM report_versions WHERE owner_id=? AND report_id=?').bind(o,id),
 stores.db.prepare('DELETE FROM reports WHERE owner_id=? AND id=? AND retention_until<=?').bind(o,id,now)
 ]);
 }
 const queued=await stores.db.prepare('SELECT object_key,owner_id,report_id FROM retention_objects LIMIT 25').all<{object_key:string,owner_id:string,report_id:string}>();
 for(const q of queued.results){await stores.bucket.delete(q.object_key);await stores.db.batch([
 stores.db.prepare('UPDATE accounts SET budget_bytes=MAX(0,budget_bytes-COALESCE((SELECT size_bytes FROM storage_objects WHERE object_key=?),0)) WHERE id=?').bind(q.object_key,q.owner_id),
 stores.db.prepare('DELETE FROM storage_objects WHERE object_key=?').bind(q.object_key),
 stores.db.prepare('DELETE FROM retention_objects WHERE object_key=?').bind(q.object_key)
 ]);}
 const remaining=await stores.db.prepare('SELECT 1 AS found FROM retention_objects LIMIT 1').first();const expired=await stores.db.prepare('SELECT 1 AS found FROM reports WHERE retention_until>0 AND retention_until<=? LIMIT 1').bind(now).first();
 return {reports:due.results.length,objects:queued.results.length,more:!!remaining||!!expired};
}
