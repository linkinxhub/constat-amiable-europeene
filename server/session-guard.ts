// Four parameters: session id, actor twice for membership, actor for suspension.
// Missing participant account rows remain compatible with sessions created before 0.6.
export const sessionCommitGuard=`EXISTS (SELECT 1 FROM shared_sessions s WHERE s.id=? AND (s.owner_id=? OR s.participant_b=?) AND EXISTS (SELECT 1 FROM reports r WHERE r.owner_id=s.owner_id AND r.id=s.report_id AND (r.retention_until=0 OR r.retention_until>CAST(strftime('%s','now') AS INTEGER)*1000)) AND NOT EXISTS (SELECT 1 FROM accounts a WHERE a.id IN (s.owner_id,?) AND a.status!='active'))`;
export const sessionGuardArgs=(session:string,actor:string)=>[session,actor,actor,actor];
