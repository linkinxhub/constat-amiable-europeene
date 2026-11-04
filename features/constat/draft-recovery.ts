import {z} from 'zod';
import {schema,type Report} from './model.ts';
import {REPORT_BYTES} from './photo-limits.ts';
import {retentionDeadline} from './retention.ts';
const backup=z.object({format:z.literal('accordia-local-draft'),version:z.literal(1),report:schema}).strict();
export function parseDraftBackup(text:string):Report{if(new TextEncoder().encode(text).byteLength>REPORT_BYTES)throw new Error('too_large');return backup.parse(JSON.parse(text)).report}
export function recoveredDraft(report:Report,id:string,now=new Date().toISOString()):Report{
 const created=report.localCreatedAt||report.updated||now;if(retentionDeadline(created)<=new Date(now).getTime())throw new Error('retention_expired');
 return schema.parse({...report,id,updated:now,localCreatedAt:created,start:report.start?{...report.start,participationMode:report.start.participationMode==='same-device'?'same-device':'solo',autoSketch:false}:undefined});
}
