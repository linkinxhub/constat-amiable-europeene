import {ReportError,type Stores} from './report-service.ts';
import {sessionCommitGuard,sessionGuardArgs} from './session-guard.ts';
// A conservative call cap, not a promise about currency-denominated cost.
export const AI_DAILY_CALL_LIMIT=100;
export async function reserveAiCall(stores:Stores,actor:string,session:string,kind:'sketch'|'translation'){
 const day=new Date().toISOString().slice(0,10);
 const result=await stores.db.prepare(`INSERT INTO ai_daily_usage(day,calls,sketches,translations)
 SELECT ?,1,?,? WHERE ${sessionCommitGuard}
 ON CONFLICT(day) DO UPDATE SET calls=calls+1,sketches=sketches+excluded.sketches,translations=translations+excluded.translations
 WHERE calls<?`).bind(day,kind==='sketch'?1:0,kind==='translation'?1:0,...sessionGuardArgs(session,actor),AI_DAILY_CALL_LIMIT).run();
 if(result.meta.changes!==1)throw new ReportError(429,'ai_daily_limit');
}
