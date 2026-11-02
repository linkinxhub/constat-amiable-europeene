import {retentionDeadline} from '../features/constat/retention.ts';
import {checkRetention} from './retention-service.ts';
import {storeObject} from './object-storage.ts';
import {validatePhotos} from './photo-validation.ts';import {REPORT_BYTES} from '../features/constat/photo-limits.ts';
import {sessionCommitGuard,sessionGuardArgs} from './session-guard.ts';
import {z} from 'zod';
import {schema,type Report} from '../features/constat/model.ts';
export const MAX_PAYLOAD=REPORT_BYTES;
export const BUDGET=128*1024*1024;
export const recordId=z.string().regex(/^[a-zA-Z0-9_-]{16,80}$/);
export const saveSchema=z.object({report:schema,expectedRevision:z.number().int().min(0).max(1000000)}).strict();
export class ReportError extends Error{status:number;code:string;constructor(status:number,code:string){super(code);this.status=status;this.code=code;}}
export type Stores={db:D1Database,bucket:R2Bucket};
type Row={id:string,revision:number,object_key:string,title:string,accident_date:string,updated_at:string,retention_until:number};
export function identity(owner:string|null){if(!owner)throw new ReportError(401,'unauthenticated');return owner;}
export async function active(db:D1Database,owner:string){identity(owner);const a=await db.prepare('SELECT status FROM accounts WHERE id = ?').bind(owner).first<{status:string}>();if(a&&a.status!=='active')throw new ReportError(403,'account_unavailable');}
export async function accountInfo(db:D1Database,owner:string){await active(db,owner);return await db.prepare('SELECT created_at, budget_bytes FROM accounts WHERE id = ?').bind(owner).first()??{created_at:null,budget_bytes:0};}
export async function listReports(stores:Stores,owner:string){await active(stores.db,owner);const rows=await stores.db.prepare('SELECT id, revision, title, accident_date, updated_at, retention_until FROM reports WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 100').bind(owner).all<Pick<Row,'id'|'revision'|'title'|'accident_date'|'updated_at'|'retention_until'>>();return rows.results.filter(r=>!r.retention_until||r.retention_until>Date.now());}
export async function readReport(stores:Stores,owner:string,id:string){await active(stores.db,owner);if(!recordId.safeParse(id).success)throw new ReportError(400,'invalid');const row=await stores.db.prepare('SELECT id, revision, object_key, title, accident_date, updated_at, retention_until FROM reports WHERE owner_id = ? AND id = ?').bind(owner,id).first<Row>();if(!row)throw new ReportError(404,'not_found');await checkRetention(stores,owner,id);const object=await stores.bucket.get(row.object_key);if(!object||object.size>MAX_PAYLOAD)throw new ReportError(503,'unavailable');const parsed=schema.safeParse(await object.json());if(!parsed.success)throw new ReportError(503,'unavailable');return {report:parsed.data,revision:row.revision,retentionUntil:row.retention_until};}
export async function writeReport(stores:Stores,owner:string,id:string,input:unknown,sessionId:string='',actor:string=owner){
 identity(owner);if(!recordId.safeParse(id).success)throw new ReportError(400,'invalid');
 const parsed=saveSchema.safeParse(input);if(!parsed.success)throw new ReportError(400,'invalid');
 const {report,expectedRevision}=parsed.data;
 if(report.id!==id)throw new ReportError(400,'invalid');
 const now=new Date().toISOString();const saved:Report={...report,id,updated:now};const json=JSON.stringify(saved);const bytes=new TextEncoder().encode(json).byteLength;
 if(bytes>MAX_PAYLOAD)throw new ReportError(413,'too_large');
 await stores.db.prepare('INSERT INTO accounts (id, created_at) VALUES (?, ?) ON CONFLICT(id) DO NOTHING').bind(owner,now).run();
 await active(stores.db,owner);
 const current=await stores.db.prepare('SELECT revision FROM reports WHERE owner_id = ? AND id = ?').bind(owner,id).first<{revision:number}>();
 await checkRetention(stores,owner,id);if(await stores.db.prepare('SELECT 1 AS found FROM retention_jobs WHERE owner_id=? AND report_id=?').bind(owner,id).first())throw new ReportError(410,'retention_expired');
 if((current?.revision??0)!==expectedRevision)throw new ReportError(409,'conflict');
 if(!current){const total=await stores.db.prepare('SELECT count(*) AS total FROM reports WHERE owner_id = ?').bind(owner).first<{total:number}>();if((total?.total??0)>=100)throw new ReportError(429,'quota');}
 const minute=Math.floor(Date.now()/60000);
 // Attempt rate is charged even when image validation fails; bytes are reserved only for storage.
 const reserved=await stores.db.prepare('UPDATE accounts SET budget_bytes = budget_bytes + ?, rate_writes = CASE WHEN rate_window = ? THEN rate_writes + 1 ELSE 1 END, rate_window = ? WHERE id = ? AND status = ? AND budget_bytes + ? <= ? AND (rate_window != ? OR rate_writes < 6)').bind(0,minute,minute,owner,'active',0,BUDGET,minute).run();
 if(reserved.meta.changes!==1)throw new ReportError(429,'quota');
 try{await validatePhotos(report.photos);}catch{throw new ReportError(400,'invalid_image');}
 const revision=expectedRevision+1;const key='reports/'+crypto.randomUUID();
 await storeObject(stores,owner,key,json,'application/json',(objectGuard,objectArgs)=>{
 const actorGuard=' AND '+objectGuard+(sessionId?' AND '+sessionCommitGuard:''), actorArgs=[...objectArgs,...(sessionId?sessionGuardArgs(sessionId,actor):[])];
 const commit=expectedRevision===0?
 stores.db.prepare('INSERT INTO reports (owner_id,id,revision,object_key,title,accident_date,updated_at,retention_until) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM reports WHERE owner_id = ?) < 100 AND EXISTS (SELECT 1 FROM accounts WHERE id = ? AND status = ?) AND NOT EXISTS (SELECT 1 FROM shared_sessions WHERE owner_id = ? AND report_id = ? AND id != ?) '+actorGuard+' ON CONFLICT(owner_id,id) DO NOTHING').bind(owner,id,revision,key,report.place.slice(0,160),report.date,now,retentionDeadline(now),owner,owner,'active',owner,id,sessionId,...actorArgs):
 stores.db.prepare('UPDATE reports SET revision = ?, object_key = ?, title = ?, accident_date = ?, updated_at = ? WHERE owner_id = ? AND id = ? AND revision = ? AND (retention_until=0 OR retention_until>CAST(strftime(\'%s\',\'now\') AS INTEGER)*1000) AND EXISTS (SELECT 1 FROM accounts WHERE id = ? AND status = ?) AND NOT EXISTS (SELECT 1 FROM shared_sessions WHERE owner_id = ? AND report_id = ? AND id != ?)'+actorGuard).bind(revision,key,report.place.slice(0,160),report.date,now,owner,id,expectedRevision,owner,'active',owner,id,sessionId,...actorArgs);
 const history=stores.db.prepare('INSERT INTO report_versions (owner_id,report_id,revision,object_key,created_at,size_bytes) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM reports WHERE owner_id = ? AND id = ? AND object_key = ?)').bind(owner,id,revision,key,now,bytes,owner,id,key);
 return [commit,history];
 });
 return {report:saved,revision};
}
