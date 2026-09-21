import {z} from 'zod';
import {ReportError,active,recordId} from './report-service.ts';
const operation=z.object({id:z.string().uuid(),reportId:recordId,kind:z.enum(['sketch','translation'])}).strict();
type Operation=z.infer<typeof operation>;

// Internal ledger: reserve and count in one statement, never read then decrement.
export async function reserveTestCredit(db:D1Database,owner:string,input:unknown){
  await active(db,owner);
  const parsed=operation.safeParse(input);if(!parsed.success)throw new ReportError(400,'invalid');
  const op=parsed.data,now=Date.now();
  const inserted=await db.prepare(`INSERT INTO billing_test_uses(id,order_id,kind,state,created_at,updated_at)
    SELECT ?,o.id,?,'reserved',?,? FROM billing_test_orders o
    JOIN billing_test_grants g ON g.order_id=o.id
    JOIN accounts a ON a.id=o.owner_id
    JOIN reports r ON r.owner_id=o.owner_id AND r.id=o.report_id
    WHERE o.owner_id=? AND o.report_id=? AND a.status='active' AND g.state='granted'
    AND r.retention_until>? AND g.expires_at>?
    AND (SELECT COUNT(*) FROM billing_test_uses u WHERE u.order_id=o.id AND u.state IN ('reserved','succeeded'))<g.credits
    ON CONFLICT(id) DO NOTHING`).bind(op.id,op.kind,now,now,owner,op.reportId,now,now).run();
  const row=await db.prepare(`SELECT u.state,u.kind,o.report_id FROM billing_test_uses u JOIN billing_test_orders o ON o.id=u.order_id WHERE u.id=? AND o.owner_id=?`).bind(op.id,owner).first<{state:string;kind:string;report_id:string}>();
  if(!row)throw new ReportError(409,'test_credit_unavailable');
  if(row.kind!==op.kind||row.report_id!==op.reportId)throw new ReportError(409,'test_operation_conflict');
  return {created:inserted.meta.changes===1,state:row.state};
}

// Service completion must still settle after suspension/expiry to avoid lost holds.
// It has no client route. Only the same owner and the reserved operation may settle.
export async function settleTestCredit(db:D1Database,owner:string,id:string,succeeded:boolean){
  if(!z.string().uuid().safeParse(id).success||typeof succeeded!=='boolean')throw new ReportError(400,'invalid');
  const state=succeeded?'succeeded':'released';
  await db.prepare(`UPDATE billing_test_uses SET state=?,updated_at=? WHERE id=? AND state='reserved'
    AND EXISTS(SELECT 1 FROM billing_test_orders o WHERE o.id=billing_test_uses.order_id AND o.owner_id=?)`).bind(state,Date.now(),id,owner).run();
  const row=await db.prepare(`SELECT u.state FROM billing_test_uses u JOIN billing_test_orders o ON o.id=u.order_id WHERE u.id=? AND o.owner_id=?`).bind(id,owner).first<{state:string}>();
  if(row?.state!==state)throw new ReportError(409,'test_operation_conflict');
}

// work must include durable output storage. A storage failure after work succeeds
// does not release the hold: that uncertain outcome needs reconciliation.
export async function withTestCredit<T>(db:D1Database,owner:string,op:Operation,work:()=>Promise<T>):Promise<T>{
  const reservation=await reserveTestCredit(db,owner,op);
  if(!reservation.created)throw new ReportError(409,'test_operation_already_started');
  let result:T;
  try{result=await work()}catch(error){await settleTestCredit(db,owner,op.id,false);throw error}
  await settleTestCredit(db,owner,op.id,true);
  return result;
}
