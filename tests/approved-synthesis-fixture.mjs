// Explicit, persisted precondition for sketch-only tests; never shipped as a service bypass.
export async function approvedSummary(stores,session,revision){
 const id=crypto.randomUUID(),content=JSON.stringify({language:'fr',declaredA:['Synthetic A'],declaredB:['Synthetic B'],agreements:[],disagreements:['Synthetic disagreement'],missing:[]});
 await stores.db.prepare('INSERT INTO synthesis_proposals(id,session_id,source_revision,content,approved_a,approved_b) VALUES (?,?,?,?,1,1)').bind(id,session,revision,content).run();
 await stores.db.prepare('UPDATE shared_sessions SET summary_consent_a=?,summary_consent_b=? WHERE id=?').bind(revision,revision,session).run();return id;
}
