// Seed confirmed snapshots for tests unrelated to the finish workflow.
// Workflow regressions use updateSession(..., finish:true) instead.
import {readSession} from '../server/session-service.ts';
import {participantHash} from '../server/participant-progress.ts';
export async function confirmedSession(stores,id){const {report}=await readSession(stores,'A',id);const stamp=async side=>JSON.stringify({hash:await participantHash(report,side),at:new Date().toISOString()});await stores.db.prepare('UPDATE shared_sessions SET done_a=?,done_b=? WHERE id=?').bind(await stamp('A'),await stamp('B'),id).run();}
