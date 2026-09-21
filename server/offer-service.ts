import {z} from 'zod';
import {offerIds} from '../features/constat/offer-model.ts';
import {active,ReportError} from './report-service.ts';
const preference=z.object({offer:z.enum(offerIds)}).strict();
export async function readOffer(db:D1Database,owner:string){await active(db,owner);return await db.prepare('SELECT offer,updated_at FROM offer_preferences WHERE owner_id=?').bind(owner).first()??{offer:null,updated_at:null};}
export async function saveOffer(db:D1Database,owner:string,input:unknown){await active(db,owner);const p=preference.safeParse(input);if(!p.success)throw new ReportError(400,'invalid');const now=new Date().toISOString();await db.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?) ON CONFLICT(id) DO NOTHING').bind(owner,now).run();const result=await db.prepare("INSERT INTO offer_preferences(owner_id,offer,updated_at) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM accounts WHERE id=? AND status='active') ON CONFLICT(owner_id) DO UPDATE SET offer=excluded.offer,updated_at=excluded.updated_at").bind(owner,p.data.offer,now,owner).run();if(result.meta.changes!==1)throw new ReportError(403,'account_unavailable');return readOffer(db,owner);}
