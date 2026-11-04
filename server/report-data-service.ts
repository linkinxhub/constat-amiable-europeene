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
 // Refuse shared dossiers atomically, including a concurrent invitation. Access
 // expires immediately; the existing resumable retention worker removes objects.
 const now=Date.now();const result=await stores.db.prepare("UPDATE reports SET retention_until=? WHERE owner_id=? AND id=? AND revision=? AND (retention_until=0 OR retention_until>?) AND EXISTS(SELECT 1 FROM accounts WHERE id=? AND status='active') AND NOT EXISTS(SELECT 1 FROM shared_sessions WHERE owner_id=? AND report_id=?)").bind(1,owner,id,p.data.expectedRevision,now,owner,owner,id).run();
 if(result.meta.changes!==1){await readReport(stores,owner,id);if(await stores.db.prepare('SELECT id FROM shared_sessions WHERE owner_id=? AND report_id=?').bind(owner,id).first())throw new ReportError(409,'shared_session');throw new ReportError(409,'conflict')}
 return {requested:true,accessRemoved:true,physicalDeletion:'pending' as const};
}
