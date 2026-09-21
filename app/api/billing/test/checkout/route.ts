import {env} from 'cloudflare:workers';
import {authorizedStores} from '@/server/stores';
import {isSuperAdmin} from '@/server/ai-settings';
import {ReportError} from '@/server/report-service';
import {json,failure,writeGuard,readJson} from '@/server/http';
import {billingTestConfiguration} from '@/server/billing-http';
import {testStripeClient} from '@/server/stripe-test';
import {startTestPurchase} from '@/server/billing-flow';

export async function POST(req:Request){
  try{
    const {owner,stores}=await authorizedStores({maintenance:false});
    if(!await isSuperAdmin(stores.db,owner))throw new ReportError(403,'forbidden');
    writeGuard(req);
    const config=billingTestConfiguration(env);
    const input=await readJson(req,1024);
    return json(await startTestPurchase(stores.db,testStripeClient(config.apiKey),owner,input));
  }catch(error){return failure(error)}
}
