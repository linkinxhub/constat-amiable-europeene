import type Stripe from 'stripe';
import {z} from 'zod';
import {createTestOrder,attachTestSession,recordTestConfirmation} from './billing-orders.ts';
import {createTestCheckout,verifyTestCheckoutEvent} from './stripe-test.ts';
import {active,ReportError} from './report-service.ts';

const storedSession=z.object({
  id:z.string().regex(/^cs_test_[A-Za-z0-9]+$/),livemode:z.literal(false),mode:z.literal('payment'),
  client_reference_id:z.string().uuid(),metadata:z.object({accordia_order:z.string().uuid(),accordia_sku:z.literal('report')}),
  currency:z.literal('eur'),amount_total:z.literal(690),
  status:z.enum(['open','complete','expired']),url:z.string().nullable(),
});

// Internal orchestration only; HTTP routes and the sales switch are not enabled.
export async function startTestPurchase(db:D1Database,client:Stripe,owner:string,input:unknown){
  const order=await createTestOrder(db,owner,input);
  if(await db.prepare('SELECT 1 FROM billing_test_receipts WHERE order_id=?').bind(order.id).first())return {state:'confirmed' as const,orderId:order.id};
  if(order.session_id){
    const session=storedSession.parse(await client.checkout.sessions.retrieve(order.session_id));
    if(session.id!==order.session_id||session.client_reference_id!==order.id||session.metadata.accordia_order!==order.id)throw new ReportError(409,'checkout_mismatch');
    if(session.status==='expired')throw new ReportError(409,'checkout_expired');
    if(session.status==='complete')return {state:'pending_confirmation' as const,orderId:order.id};
    const url=new URL(session.url??'');
    if(url.origin!=='https://checkout.stripe.com'||url.username||url.password)throw new ReportError(409,'checkout_mismatch');
    return {state:'open' as const,orderId:order.id,url:url.href};
  }
  // Stripe may prune idempotency keys after 24 h. Never silently create another
  // session for an old order whose original provider response may have been lost.
  if(Date.now()-order.created_at>23*3600000)throw new ReportError(409,'checkout_reconciliation_required');
  const session=await createTestCheckout(client,{id:order.id,sku:'report',locale:order.locale});
  await attachTestSession(db,owner,order.id,session.id);
  return {state:'open' as const,orderId:order.id,url:session.url};
}

type Grant={order_id:string;state:'granted'|'review_required';credits:number;expires_at:number};

// A receipt can survive a crash before granting. Replaying the signed event
// resumes this step, while the primary key prevents replenishing an existing grant.
async function grantTestPurchase(db:D1Database,orderId:string){
  const now=Date.now();
  await db.prepare(`INSERT INTO billing_test_grants(order_id,state,credits,expires_at,created_at)
    SELECT o.id,CASE WHEN a.status='active' AND r.retention_until>? THEN 'granted' ELSE 'review_required' END,
    CASE WHEN a.status='active' AND r.retention_until>? THEN 10 ELSE 0 END,
    COALESCE(r.retention_until,0),? FROM billing_test_orders o
    JOIN billing_test_receipts p ON p.order_id=o.id AND p.session_id=o.session_id
    LEFT JOIN accounts a ON a.id=o.owner_id
    LEFT JOIN reports r ON r.owner_id=o.owner_id AND r.id=o.report_id
    WHERE o.id=? ON CONFLICT(order_id) DO NOTHING`).bind(now,now,now,orderId).run();
  const grant=await db.prepare('SELECT order_id,state,credits,expires_at FROM billing_test_grants WHERE order_id=?').bind(orderId).first<Grant>();
  if(!grant)throw new ReportError(409,'grant_unavailable');
  return grant;
}

export async function handleTestPayment(db:D1Database,client:Stripe,raw:string,signature:string,secret:string){
  const confirmation=await verifyTestCheckoutEvent(client,raw,signature,secret);
  if(!confirmation)return {state:'ignored' as const};
  const receipt=await recordTestConfirmation(db,confirmation);
  const grant=await grantTestPurchase(db,receipt.orderId);
  return {state:grant.state,orderId:receipt.orderId};
}

// Test-only entitlements, deliberately unused by the current AI endpoints.
export async function readTestCredits(db:D1Database,owner:string,reportId:string){
  await active(db,owner);
  const grant=await db.prepare(`SELECT MAX(0,g.credits-(SELECT COUNT(*) FROM billing_test_uses u WHERE u.order_id=g.order_id AND u.state IN ('reserved','succeeded'))) AS credits FROM billing_test_grants g
    JOIN billing_test_orders o ON o.id=g.order_id
    JOIN accounts a ON a.id=o.owner_id
    JOIN reports r ON r.owner_id=o.owner_id AND r.id=o.report_id
    WHERE o.owner_id=? AND o.report_id=? AND a.status='active' AND g.state='granted'
    AND g.expires_at>? AND r.retention_until>?`).bind(owner,reportId,Date.now(),Date.now()).first<{credits:number}>();
  return grant?.credits??0;
}
