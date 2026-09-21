import {z} from 'zod';
import {active,identity,ReportError} from './report-service.ts';

export type AiEnvironment={AI_SETTINGS_ENCRYPTION_KEY?:string;SUPER_ADMIN_SETUP_HASH?:string;SUPER_ADMIN_SETUP_EXPIRES?:string;OPENAI_API_KEY?:string;OPENAI_SKETCH_MODEL?:string};
type Row={id:string;admin_id:string;revision:number;encrypted_key:string|null;model:string;enabled:number;updated_at:string;test_after:number};
const encoder=new TextEncoder();
const aad=encoder.encode('accordia:openai-settings:v1');
const settingsSchema=z.object({revision:z.number().int().nonnegative(),model:z.string().trim().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/),enabled:z.boolean(),apiKey:z.string().trim().regex(/^sk-[A-Za-z0-9_-]{17,497}$/).optional()}).strict();
const getRow=(db:D1Database)=>db.prepare("SELECT * FROM ai_settings WHERE id='platform'").first<Row>();
export async function isSuperAdmin(db:D1Database,actor:string){await active(db,actor);return (await getRow(db))?.admin_id===actor;}
async function requireAdmin(db:D1Database,actor:string){identity(actor);await active(db,actor);const row=await getRow(db);if(!row||row.admin_id!==actor)throw new ReportError(403,'forbidden');return row;}
function unbase64(value:string){try{return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}catch{throw new ReportError(503,'ai_configuration');}}
function base64(value:Uint8Array){return btoa(String.fromCharCode(...value));}
async function cipherKey(env:AiEnvironment){const bytes=unbase64(env.AI_SETTINGS_ENCRYPTION_KEY||'');if(bytes.length!==32)throw new ReportError(503,'ai_configuration');return crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt','decrypt']);}
async function seal(value:string,env:AiEnvironment){const iv=crypto.getRandomValues(new Uint8Array(12));const result=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},await cipherKey(env),encoder.encode(value));return 'v1.'+base64(iv)+'.'+base64(new Uint8Array(result));}
async function unseal(value:string,env:AiEnvironment){try{const [version,iv,data,...rest]=value.split('.');if(version!=='v1'||rest.length)throw new Error();return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(iv),additionalData:aad},await cipherKey(env),unbase64(data)));}catch{throw new ReportError(503,'ai_configuration');}}
export async function activateAdmin(db:D1Database,actor:string,code:unknown,env:AiEnvironment){
 identity(actor);await active(db,actor);
 if(typeof code!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(code))throw new ReportError(403,'activation_invalid');
 const expiry=Number(env.SUPER_ADMIN_SETUP_EXPIRES);if(!Number.isFinite(expiry)||expiry<=Date.now()||!env.SUPER_ADMIN_SETUP_HASH)throw new ReportError(403,'activation_invalid');
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(code))),b=>b.toString(16).padStart(2,'0')).join('');
 // The code is high entropy and is delivered privately to the Site owner, never derived from an email.
 if(digest!==env.SUPER_ADMIN_SETUP_HASH)throw new ReportError(403,'activation_invalid');
 await cipherKey(env);
 const result=await db.prepare("INSERT INTO ai_settings(id,admin_id,revision,model,enabled,updated_at,test_after) SELECT 'platform',?,0,'',0,?,0 WHERE NOT EXISTS(SELECT 1 FROM accounts WHERE id=? AND status!='active') ON CONFLICT(id) DO NOTHING").bind(actor,new Date().toISOString(),actor).run();
 if(result.meta.changes!==1)throw new ReportError(409,'activation_used');
 return {ok:true};
}
function metadata(row:Row,env:AiEnvironment){return {revision:row.revision,hasKey:!!row.encrypted_key,model:row.model,enabled:!!row.enabled,updatedAt:row.updated_at,secureStorageReady:!!env.AI_SETTINGS_ENCRYPTION_KEY};}
export async function readAiSettings(db:D1Database,actor:string,env:AiEnvironment){return metadata(await requireAdmin(db,actor),env);}
export async function saveAiSettings(db:D1Database,actor:string,input:unknown,env:AiEnvironment){
 const row=await requireAdmin(db,actor);const parsed=settingsSchema.safeParse(input);if(!parsed.success)throw new ReportError(400,'invalid');const data=parsed.data;
 if(data.revision!==row.revision)throw new ReportError(409,'conflict');
 const encrypted=data.apiKey?await seal(data.apiKey,env):row.encrypted_key;
 if(data.enabled&&!encrypted)throw new ReportError(400,'key_required');
 const stamp=new Date().toISOString();const res=await db.prepare("UPDATE ai_settings SET encrypted_key=?,model=?,enabled=?,revision=revision+1,updated_at=? WHERE id='platform' AND admin_id=? AND revision=? AND NOT EXISTS(SELECT 1 FROM accounts WHERE id=? AND status!='active')").bind(encrypted,data.model,data.enabled?1:0,stamp,actor,data.revision,actor).run();
 if(res.meta.changes!==1)throw new ReportError(409,'conflict');
 return metadata({...row,encrypted_key:encrypted,model:data.model,enabled:data.enabled?1:0,revision:row.revision+1,updated_at:stamp},env);
}
// Once admin settings exist, disabled means disabled: no silent environment fallback.
export async function resolveSketchConfig(db:D1Database,env:AiEnvironment,decrypt=true){const row=await getRow(db);if(!row)return {OPENAI_API_KEY:env.OPENAI_API_KEY,OPENAI_SKETCH_MODEL:env.OPENAI_SKETCH_MODEL};if(!row.enabled||!row.encrypted_key||!row.model)return {};return {OPENAI_API_KEY:decrypt?await unseal(row.encrypted_key,env):'configured',OPENAI_SKETCH_MODEL:row.model};}
export async function testAiConnection(db:D1Database,actor:string,revision:number,env:AiEnvironment){
 const row=await requireAdmin(db,actor);if(row.revision!==revision)throw new ReportError(409,'conflict');if(!row.encrypted_key||!row.model)throw new ReportError(400,'key_required');
 const now=Date.now();const lock=await db.prepare("UPDATE ai_settings SET test_after=? WHERE id='platform' AND admin_id=? AND revision=? AND test_after<=? AND NOT EXISTS(SELECT 1 FROM accounts WHERE id=? AND status!='active')").bind(now+10000,actor,revision,now,actor).run();if(lock.meta.changes!==1)throw new ReportError(429,'rate_limited');
 const key=await unseal(row.encrypted_key,env);
 let response:Response;try{response=await fetch('https://api.openai.com/v1/models/'+encodeURIComponent(row.model),{headers:{Authorization:'Bearer '+key},redirect:'error',signal:AbortSignal.timeout(10000)});}catch{throw new ReportError(502,'provider_unavailable');}
 // Never expose an upstream error body, which may contain credential/account details.
 await response.body?.cancel();
 if(response.status===401)throw new ReportError(400,'provider_key');if(response.status===403||response.status===404)throw new ReportError(400,'provider_model');if(!response.ok)throw new ReportError(502,'provider_unavailable');
 const latest=await requireAdmin(db,actor);if(latest.revision!==revision)throw new ReportError(409,'conflict');return {ok:true,revision};
}
