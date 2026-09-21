import {env} from 'cloudflare:workers';
import Stripe from 'stripe';
import {ZodError} from 'zod';
import {ReportError} from '@/server/report-service';
import {json,failure} from '@/server/http';
import {billingTestConfiguration,readStripeBody} from '@/server/billing-http';
import {testStripeClient} from '@/server/stripe-test';
import {handleTestPayment} from '@/server/billing-flow';

// Stripe authenticates using its signature, not a browser session or CSRF token.
// Site audience is unchanged; hosted reachability must be verified before setup.
export async function POST(req:Request){
  try{
    const config=billingTestConfiguration(env);
    if(!env.DB)throw new ReportError(503,'unavailable');
    const {raw,signature}=await readStripeBody(req);
    await handleTestPayment(env.DB,testStripeClient(config.apiKey),raw,signature,config.signingSecret);
    return json({received:true});
  }catch(error){
    if(error instanceof Stripe.errors.StripeSignatureVerificationError||error instanceof ZodError||error instanceof SyntaxError)return json({error:'invalid_webhook'},400);
    return failure(error);
  }
}
