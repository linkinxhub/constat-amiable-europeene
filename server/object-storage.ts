import {active,BUDGET,ReportError,type Stores} from './report-service.ts';

// All references, including frozen PDF sources and old report versions, are protected.
const referenced=`(EXISTS (SELECT 1 FROM reports WHERE object_key=storage_objects.object_key)
 OR EXISTS (SELECT 1 FROM report_versions WHERE object_key=storage_objects.object_key)
 OR EXISTS (SELECT 1 FROM sketch_proposals WHERE object_key=storage_objects.object_key)
 OR EXISTS (SELECT 1 FROM final_documents WHERE storage_objects.object_key IN (preview_key,report_key,sketch_key,signature_a,signature_b,pdf_key)))`;

async function cleanup(stores:Stores,key:string,expiredOnly=false){
 await stores.db.prepare(`UPDATE storage_objects SET state='cleanup' WHERE object_key=? AND state!='cleanup' AND ${expiredOnly?'expires_at<? AND ':''}NOT ${referenced}`).bind(...(expiredOnly?[key,Date.now()]:[key])).run();
 const row=await stores.db.prepare("SELECT owner_id,size_bytes FROM storage_objects WHERE object_key=? AND state='cleanup'").bind(key).first<{owner_id:string,size_bytes:number}>();if(!row){const tracked=await stores.db.prepare('SELECT object_key FROM storage_objects WHERE object_key=?').bind(key).first();if(!tracked)await stores.bucket.delete(key);return;}
 // State 'cleanup' prevents a delayed writer from committing a reference to this key.
 await stores.bucket.delete(key);
 await stores.db.batch([
  stores.db.prepare("UPDATE accounts SET budget_bytes=MAX(0,budget_bytes-?) WHERE id=? AND EXISTS (SELECT 1 FROM storage_objects WHERE object_key=? AND state='cleanup')").bind(row.size_bytes,row.owner_id,key),
  stores.db.prepare("DELETE FROM storage_objects WHERE object_key=? AND state='cleanup'").bind(key)
 ]);
}

export async function storeObject(stores:Stores,owner:string,key:string,value:string|Uint8Array,contentType:string,commit:(guard:string,args:unknown[])=>D1PreparedStatement[]){
 const size=typeof value==='string'?new TextEncoder().encode(value).byteLength:value.byteLength;
 const reservation=await stores.db.batch([
  stores.db.prepare("INSERT INTO storage_objects(object_key,owner_id,size_bytes,state,expires_at) SELECT ?,?,?,'pending',? WHERE EXISTS (SELECT 1 FROM accounts WHERE id=? AND status='active' AND budget_bytes+?<=?)").bind(key,owner,size,Date.now()+300000,owner,size,BUDGET),
  stores.db.prepare('UPDATE accounts SET budget_bytes=budget_bytes+? WHERE id=? AND EXISTS (SELECT 1 FROM storage_objects WHERE object_key=?)').bind(size,owner,key)
 ]);
 if(reservation[0].meta.changes!==1)throw new ReportError(429,'storage_quota');
 try{
  await stores.bucket.put(key,typeof value==='string'?value:new Uint8Array(value),{httpMetadata:{contentType}});
  const guard="EXISTS (SELECT 1 FROM storage_objects WHERE object_key=? AND state='pending')";
  const result=await stores.db.batch([...commit(guard,[key]),stores.db.prepare(`UPDATE storage_objects SET state='committed' WHERE object_key=? AND ${referenced}`).bind(key)]);
  if(result[0].meta.changes!==1)throw new ReportError(409,'conflict');
 }catch(error){
  // A transport error may follow a successful DB commit: cleanup checks references first.
  try{await cleanup(stores,key)}catch{/* Retain the reservation for explicit recovery. */}
  throw error;
 }
}

export async function recoverStorage(stores:Stores,owner:string){
 await active(stores.db,owner);
 const account=await stores.db.prepare('SELECT id FROM accounts WHERE id=?').bind(owner).first();if(!account)return {ok:true};const minute=Math.floor(Date.now()/60000);const attempt=await stores.db.prepare("UPDATE accounts SET rate_writes=CASE WHEN rate_window=? THEN rate_writes+1 ELSE 1 END,rate_window=? WHERE id=? AND status='active' AND (rate_window!=? OR rate_writes<6)").bind(minute,minute,owner,minute).run();if(attempt.meta.changes!==1)throw new ReportError(429,'quota');
 // Index historical objects before recalculating the budget. This does not delete versions.
 const references=`WITH owned_docs AS (SELECT d.* FROM final_documents d JOIN shared_sessions s ON s.id=d.session_id WHERE s.owner_id=?), refs(k) AS (
 SELECT object_key FROM reports WHERE owner_id=? UNION SELECT object_key FROM report_versions WHERE owner_id=?
 UNION SELECT p.object_key FROM sketch_proposals p JOIN shared_sessions s ON s.id=p.session_id WHERE s.owner_id=?
 UNION SELECT j.value FROM owned_docs d, json_each(json_array(d.preview_key,d.report_key,d.sketch_key,d.signature_a,d.signature_b,d.pdf_key)) j)`;
 const missing=`SELECT k FROM refs WHERE k IS NOT NULL AND k!='' AND NOT EXISTS (SELECT 1 FROM storage_objects o WHERE o.object_key=refs.k)`;
 const keys=await stores.db.prepare(references+' '+missing+' LIMIT 25').bind(owner,owner,owner,owner).all<{k:string}>();
 for(const {k} of keys.results){const object=await stores.bucket.head(k);if(!object)throw new ReportError(503,'unavailable');await stores.db.prepare("INSERT INTO storage_objects(object_key,owner_id,size_bytes,state,expires_at) VALUES (?,?,?,'committed',0) ON CONFLICT(object_key) DO NOTHING").bind(k,owner,object.size).run();}
 const moreIndex=await stores.db.prepare(references+' '+missing+' LIMIT 1').bind(owner,owner,owner,owner).first();
 if(moreIndex)return {ok:true,more:true,processed:keys.results.length};
 const pending=await stores.db.prepare(`SELECT object_key FROM storage_objects WHERE owner_id=? AND expires_at<? AND NOT ${referenced} LIMIT 10`).bind(owner,Date.now()).all<{object_key:string}>();
 for(const row of pending.results)await cleanup(stores,row.object_key,true);
 await stores.db.prepare("UPDATE accounts SET budget_bytes=(SELECT COALESCE(SUM(size_bytes),0) FROM storage_objects WHERE owner_id=?) WHERE id=? AND status='active'").bind(owner,owner).run();
 const more=await stores.db.prepare(`SELECT object_key FROM storage_objects WHERE owner_id=? AND expires_at<? AND NOT ${referenced} LIMIT 1`).bind(owner,Date.now()).first();
 return {ok:true,more:!!more,processed:keys.results.length+pending.results.length};
}
