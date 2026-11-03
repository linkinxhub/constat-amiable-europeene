import {isSuperAdmin} from './ai-settings.ts';
import {identity,ReportError} from './report-service.ts';
import {mobileCommandSchema,mobileDefaults,mobilePresentationSchema} from '../features/mobile/model.ts';
type Row={revision:number;state:string;config:string;actor:string;created_at:string;source_revision:number|null};
async function admin(db:D1Database,actor:string){identity(actor);if(!await isSuperAdmin(db,actor))throw new ReportError(403,'forbidden');}
function presentation(row:Row){return {schemaVersion:1,revision:row.revision,...mobilePresentationSchema.parse(JSON.parse(row.config))};}
export async function readPublishedMobile(db:D1Database){const row=await db.prepare("SELECT * FROM mobile_settings WHERE state='published' ORDER BY revision DESC LIMIT 1").first<Row>();return row?presentation(row):{schemaVersion:1,revision:0,...mobileDefaults};}
export async function readMobileAdmin(db:D1Database,actor:string){await admin(db,actor);const rows=(await db.prepare('SELECT * FROM mobile_settings ORDER BY revision DESC LIMIT 50').all<Row>()).results;return {revision:rows[0]?.revision??0,published:await readPublishedMobile(db),history:rows.map(row=>({...presentation(row),state:row.state,actor:row.actor,createdAt:row.created_at,sourceRevision:row.source_revision}))};}
export async function saveMobileSettings(db:D1Database,actor:string,input:unknown){
 await admin(db,actor);const parsed=mobileCommandSchema.safeParse(input);if(!parsed.success)throw new ReportError(400,'invalid');const command=parsed.data;
 let config,source:number|null=null;
 if(command.action==='draft')config=command.config;
 else {source=command.sourceRevision;const row=await db.prepare('SELECT * FROM mobile_settings WHERE revision=?').bind(source).first<Row>();if(!row)throw new ReportError(404,'not_found');
  if(command.action==='publish'&&(row.state!=='draft'||row.revision!==command.expectedRevision))throw new ReportError(409,'conflict');
  if(command.action==='rollback'&&row.state!=='published')throw new ReportError(400,'invalid');
  config=mobilePresentationSchema.parse(JSON.parse(row.config));
 }
 const revision=command.expectedRevision+1;
 const result=await db.prepare("INSERT INTO mobile_settings(revision,state,config,actor,created_at,source_revision) SELECT ?,?,?,?,?,? WHERE (SELECT COALESCE(MAX(revision),0) FROM mobile_settings)=? AND EXISTS(SELECT 1 FROM ai_settings WHERE id='platform' AND admin_id=?) AND NOT EXISTS(SELECT 1 FROM accounts WHERE id=? AND status!='active') ON CONFLICT(revision) DO NOTHING").bind(revision,command.action==='draft'?'draft':'published',JSON.stringify(config),actor,new Date().toISOString(),source,command.expectedRevision,actor,actor).run();
 if(result.meta.changes!==1)throw new ReportError(409,'conflict');return readMobileAdmin(db,actor);
}
