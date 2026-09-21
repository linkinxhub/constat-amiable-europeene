import {z} from 'zod';
import {active,recordId,ReportError} from './report-service.ts';

type Order={id:string;owner_id:string;report_id:string;locale:'fr'|'en'|'de'|'nl';session_id:string|null;created_at:number};
const selection=z.object({reportId:recordId,locale:z.enum(['fr','en','de','nl'])}).strict();

export async function readTestOrder(db:D1Database,owner:string,id:string):Promise<Order>{
  await active(db,owner);
  const order=await db.prepare('SELECT id,owner_id,report_id,locale,session_id,created_at FROM billing_test_orders WHERE id=? AND owner_id=?').bind(id,owner).first<Order>();
  if(!order)throw new ReportError(404,'order_unavailable');
  return order;
}

// One immutable test purchase per report; concurrent requests reuse the same order.
export async function createTestOrder(db:D1Database,owner:string,input:unknown){
  await active(db,owner);
  const parsed=selection.safeParse(input);if(!parsed.success)throw new ReportError(400,'invalid');
  const {reportId,locale}=parsed.data;
  await db.prepare(`INSERT INTO billing_test_orders(id,owner_id,report_id,locale,created_at)
    SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM reports r JOIN accounts a ON a.id=r.owner_id
    WHERE r.owner_id=? AND r.id=? AND r.retention_until>? AND a.status='active')
    ON CONFLICT(owner_id,report_id) DO NOTHING`).bind(crypto.randomUUID(),owner,reportId,locale,Date.now(),owner,reportId,Date.now()).run();
  const row=await db.prepare(`SELECT o.id FROM billing_test_orders o JOIN reports r ON r.owner_id=o.owner_id AND r.id=o.report_id
    JOIN accounts a ON a.id=o.owner_id WHERE o.owner_id=? AND o.report_id=? AND r.retention_until>? AND a.status='active'`).bind(owner,reportId,Date.now()).first<{id:string}>();
  if(!row)throw new ReportError(404,'order_unavailable');
  return readTestOrder(db,owner,row.id);
}

export async function attachTestSession(db:D1Database,owner:string,orderId:string,sessionId:string){
  if(!/^cs_test_[A-Za-z0-9]+$/.test(sessionId))throw new ReportError(400,'invalid');
  await active(db,owner);
  const result=await db.prepare(`UPDATE billing_test_orders SET session_id=? WHERE id=? AND owner_id=?
    AND (session_id IS NULL OR session_id=?) AND EXISTS(SELECT 1 FROM accounts a JOIN reports r ON r.owner_id=a.id
    WHERE a.id=billing_test_orders.owner_id AND a.status='active' AND r.id=billing_test_orders.report_id AND r.retention_until>?)`)
    .bind(sessionId,orderId,owner,sessionId,Date.now()).run();
  if(result.meta.changes!==1)throw new ReportError(409,'order_session_conflict');
}

const confirmation=z.object({eventId:z.string().regex(/^evt_[A-Za-z0-9]+$/),sessionId:z.string().regex(/^cs_test_[A-Za-z0-9]+$/),orderId:z.string().uuid()}).strict();

// Internal only: call after verifyTestCheckoutEvent, never with browser input.
// A receipt records payment evidence; it does not enable AI or give credits.
export async function recordTestConfirmation(db:D1Database,input:unknown){
  const parsed=confirmation.safeParse(input);if(!parsed.success)throw new ReportError(400,'invalid');
  const {eventId,sessionId,orderId}=parsed.data;
  const result=await db.prepare(`INSERT INTO billing_test_receipts(event_id,order_id,session_id,received_at)
    SELECT ?,id,session_id,? FROM billing_test_orders WHERE id=? AND session_id=?
    ON CONFLICT DO NOTHING`).bind(eventId,Date.now(),orderId,sessionId).run();
  const receipt=await db.prepare('SELECT event_id,order_id,session_id FROM billing_test_receipts WHERE order_id=? OR event_id=?').bind(orderId,eventId).all<{event_id:string;order_id:string;session_id:string}>();
  if(receipt.results.length!==1||receipt.results[0].order_id!==orderId||receipt.results[0].session_id!==sessionId)throw new ReportError(409,'payment_confirmation_conflict');
  return {recorded:result.meta.changes===1,orderId};
}
