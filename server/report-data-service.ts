import {z} from 'zod';
import {active,readReport,recordId,ReportError,type Stores} from './report-service.ts';
export async function exportReportData(stores:Stores,owner:string,id:string){
 const current=await readReport(stores,owner,id);
 const versions=await stores.db.prepare('SELECT revision,created_at,size_bytes FROM report_versions WHERE owner_id=? AND report_id=? AND revision<=? ORDER BY revision DESC LIMIT 100').bind(owner,id,current.revision).all();
 const session=await stores.db.prepare('SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?').bind(owner,id).first<{id:string}>();
 return {format:'accordia-server-report',version:1,exportedAt:new Date().toISOString(),...current,versions:versions.results,sessionId:session?.id??null};
}
export async function requestReportDeletion(stores:Stores,owner:string,id:string,input:unknown){
 await active(stores.db,owner);if(!recordId.safeParse(id).success)throw new ReportError(400,'invalid');
 const p=z.object({expectedRevision:z.number().int().positive(),confirm:z.literal(true)}).strict().safeParse(input);if(!p.success)throw new ReportError(400,'invalid');
 const receipt=()=>stores.db.prepare('SELECT revision FROM report_deletion_requests WHERE owner_id=? AND report_id=?').bind(owner,id).first<{revision:number}>();
 const accepted={requested:true,accessRemoved:true,physicalDeletion:'pending' as const};
 const previous=await receipt();if(previous){if(previous.revision!==p.data.expectedRevision)throw new ReportError(409,'conflict');return accepted}
 // Store receipt and retire access in one transaction. The report can later be
 // purged while its minimal owner-scoped receipt still makes a retry safe.
 const result=await stores.db.batch([
  stores.db.prepare("INSERT INTO report_deletion_requests(owner_id,report_id,revision,requested_at) SELECT owner_id,id,revision,? FROM reports WHERE owner_id=? AND id=? AND revision=? AND (retention_until=0 OR retention_until>?) AND EXISTS(SELECT 1 FROM accounts WHERE id=? AND status='active') AND NOT EXISTS(SELECT 1 FROM shared_sessions WHERE owner_id=? AND report_id=?) ON CONFLICT(owner_id,report_id) DO NOTHING").bind(new Date().toISOString(),owner,id,p.data.expectedRevision,Date.now(),owner,owner,id),
  stores.db.prepare("UPDATE reports SET retention_until=1 WHERE owner_id=? AND id=? AND revision=? AND EXISTS(SELECT 1 FROM report_deletion_requests d WHERE d.owner_id=reports.owner_id AND d.report_id=reports.id AND d.revision=reports.revision) AND EXISTS(SELECT 1 FROM accounts WHERE id=? AND status='active') AND NOT EXISTS(SELECT 1 FROM shared_sessions WHERE owner_id=? AND report_id=?)").bind(owner,id,p.data.expectedRevision,owner,owner,id)
 ]);
 if(result[1].meta.changes===1)return accepted;
 const winner=await receipt();if(winner&&winner.revision===p.data.expectedRevision)return accepted;
 await readReport(stores,owner,id);if(await stores.db.prepare('SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?').bind(owner,id).first())throw new ReportError(409,'shared_session');throw new ReportError(409,'conflict');
}
