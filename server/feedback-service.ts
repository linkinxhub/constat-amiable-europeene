import {feedbackSchema,FEEDBACK_IMAGE_BYTES} from '../features/feedback/model.ts';
import {dataBytes} from '../features/constat/photo-limits.ts';
import {validatePhotos} from './photo-validation.ts';
import {active,ReportError} from './report-service.ts';
import {isSuperAdmin} from './ai-settings.ts';
type FeedbackRow={id:string;owner_id:string;category:string;message:string;lang:string;source:string;created_at:number;resolved:number;images:string;digest:string};
async function admin(db:D1Database,actor:string){if(!await isSuperAdmin(db,actor))throw new ReportError(403,'forbidden')}
export async function submitFeedback(db:D1Database,actor:string,input:unknown){
 await active(db,actor);const p=feedbackSchema.safeParse(input);if(!p.success)throw new ReportError(400,'invalid');const d=p.data;
 if(d.images.some(i=>dataBytes(i)>FEEDBACK_IMAGE_BYTES))throw new ReportError(413,'too_large');
 try{await validatePhotos(d.images.map(data=>({data,name:'feedback'})));}catch{throw new ReportError(400,'invalid_image')}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(d)))),n=>n.toString(16).padStart(2,'0')).join('');
 const previous=await db.prepare('SELECT digest FROM feedback WHERE id=? AND owner_id=?').bind(d.id,actor).first<{digest:string}>();
 if(previous){if(previous.digest!==digest)throw new ReportError(409,'conflict');return {id:d.id}}
 const now=Date.now();const result=await db.prepare(`INSERT INTO feedback(id,owner_id,category,message,lang,source,images,digest,created_at,resolved) SELECT ?,?,?,?,?,?,?,?,?,0 WHERE (SELECT COUNT(*) FROM feedback WHERE owner_id=? AND created_at>?)<5 AND (SELECT COUNT(*) FROM feedback WHERE owner_id=? AND resolved=0)<50 AND NOT EXISTS(SELECT 1 FROM accounts WHERE id=? AND status!='active') ON CONFLICT(id) DO NOTHING`).bind(d.id,actor,d.category,d.message,d.lang,d.source,JSON.stringify(d.images),digest,now,actor,now-86400000,actor,actor).run();
 if(result.meta.changes!==1){const retry=await db.prepare('SELECT digest FROM feedback WHERE id=? AND owner_id=?').bind(d.id,actor).first<{digest:string}>();if(retry?.digest===digest)return {id:d.id};throw new ReportError(429,'rate_limited')}
 return {id:d.id};
}
export async function listFeedback(db:D1Database,actor:string,offset=0){await admin(db,actor);if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)throw new ReportError(400,'invalid');const r=await db.prepare('SELECT id,category,message,lang,source,created_at,resolved,json_array_length(images) AS image_count FROM feedback ORDER BY resolved ASC,created_at DESC,id DESC LIMIT 101 OFFSET ?').bind(offset).all();return {items:r.results.slice(0,100),hasMore:r.results.length>100}}
export async function readFeedback(db:D1Database,actor:string,id:string){await admin(db,actor);if(!feedbackSchema.shape.id.safeParse(id).success)throw new ReportError(400,'invalid');const row=await db.prepare('SELECT id,category,message,lang,source,created_at,resolved,images FROM feedback WHERE id=?').bind(id).first<FeedbackRow>();if(!row)throw new ReportError(404,'not_found');return {...row,images:JSON.parse(row.images) as string[]}}
export async function resolveFeedback(db:D1Database,actor:string,id:string,resolved:boolean){await admin(db,actor);if(!feedbackSchema.shape.id.safeParse(id).success)throw new ReportError(400,'invalid');const r=await db.prepare("UPDATE feedback SET resolved=? WHERE id=? AND EXISTS(SELECT 1 FROM ai_settings WHERE id='platform' AND admin_id=?) AND NOT EXISTS(SELECT 1 FROM accounts WHERE id=? AND status!='active')").bind(resolved?1:0,id,actor,actor).run();if(r.meta.changes!==1)throw new ReportError(404,'not_found');return {ok:true}}
