import {ReportError} from './report-service.ts';

export type BillingTestEnvironment={BILLING_TEST_ENABLED?:string;STRIPE_TEST_RESTRICTED_KEY?:string;STRIPE_TEST_WEBHOOK_SECRET?:string};
export function billingTestConfiguration(env:BillingTestEnvironment){
  if(env.BILLING_TEST_ENABLED!=='1')throw new ReportError(503,'billing_test_disabled');
  if(!/^rk_test_[A-Za-z0-9]+$/.test(env.STRIPE_TEST_RESTRICTED_KEY??'')||!/^whsec_[A-Za-z0-9]+$/.test(env.STRIPE_TEST_WEBHOOK_SECRET??''))throw new ReportError(503,'billing_test_unconfigured');
  return {apiKey:env.STRIPE_TEST_RESTRICTED_KEY!,signingSecret:env.STRIPE_TEST_WEBHOOK_SECRET!};
}

// Preserve exact bytes for Stripe's signature check; never parse/re-serialize JSON.
export async function readStripeBody(req:Request,timeoutMs=10000){
  const limit=262144;
  if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new ReportError(415,'invalid');
  if(Number(req.headers.get('content-length'))>limit)throw new ReportError(413,'too_large');
  const signature=req.headers.get('stripe-signature');
  if(!signature||signature.length>4096)throw new ReportError(400,'invalid_signature');
  const reader=req.body?.getReader();if(!reader)throw new ReportError(400,'invalid');
  let timer:ReturnType<typeof setTimeout>|undefined;
  const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new ReportError(408,'body_timeout'));void reader.cancel().catch(()=>{})},timeoutMs)});
  try{
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await Promise.race([reader.read(),deadline]);if(done)break;size+=value.byteLength;if(size>limit){void reader.cancel().catch(()=>{});throw new ReportError(413,'too_large')}chunks.push(value)}
    const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength}
    return {raw:new TextDecoder('utf-8',{fatal:true}).decode(body),signature};
  }catch(error){if(error instanceof TypeError)throw new ReportError(400,'invalid');throw error}
  finally{clearTimeout(timer);reader.releaseLock()}
}
