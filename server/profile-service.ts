import {profileInput,profileSchema} from '../features/constat/vehicle-profile.ts';
import {active,ReportError,recordId,type Stores} from './report-service.ts';
export async function listProfiles(stores:Stores,owner:string){await active(stores.db,owner);const rows=await stores.db.prepare('SELECT id,label,vehicle_json,created_at FROM vehicle_profiles WHERE owner_id=? ORDER BY created_at DESC,id LIMIT 20').bind(owner).all<{id:string;label:string;vehicle_json:string;created_at:string}>();return rows.results.map(r=>profileSchema.parse({id:r.id,label:r.label,vehicle:JSON.parse(r.vehicle_json),createdAt:r.created_at}))}
export async function createProfile(stores:Stores,owner:string,input:unknown){
 await active(stores.db,owner);const p=profileInput.safeParse(input);if(!p.success)throw new ReportError(400,'invalid');
 const vehicle=JSON.stringify(p.data.vehicle);if(new TextEncoder().encode(vehicle).byteLength>16000)throw new ReportError(413,'too_large');
 if(![p.data.vehicle.plate,p.data.vehicle.model,p.data.vehicle.insurer,p.data.vehicle.policy].some(v=>v.trim()))throw new ReportError(400,'invalid');
 const now=new Date().toISOString(),id=crypto.randomUUID();await stores.db.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?) ON CONFLICT DO NOTHING').bind(owner,now).run();
 const minute=Math.floor(Date.now()/60000);const rate=await stores.db.prepare("UPDATE accounts SET rate_writes=CASE WHEN rate_window=? THEN rate_writes+1 ELSE 1 END,rate_window=? WHERE id=? AND status='active' AND (rate_window!=? OR rate_writes<6)").bind(minute,minute,owner,minute).run();if(rate.meta.changes!==1)throw new ReportError(429,'quota');
 const saved=await stores.db.prepare("INSERT INTO vehicle_profiles(owner_id,id,label,vehicle_json,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM accounts WHERE id=? AND status='active') AND (SELECT count(*) FROM vehicle_profiles WHERE owner_id=?)<20").bind(owner,id,p.data.label,vehicle,now,owner,owner).run();if(saved.meta.changes!==1)throw new ReportError(409,'profile_limit');
 return profileSchema.parse({...p.data,id,createdAt:now});
}
export async function deleteProfile(stores:Stores,owner:string,id:string){await active(stores.db,owner);if(!recordId.safeParse(id).success)throw new ReportError(400,'invalid');const result=await stores.db.prepare("DELETE FROM vehicle_profiles WHERE owner_id=? AND id=? AND EXISTS(SELECT 1 FROM accounts WHERE id=? AND status='active')").bind(owner,id,owner).run();if(result.meta.changes!==1)throw new ReportError(404,'not_found');return {deleted:true}}
