import {env} from 'cloudflare:workers';
import {authorizedStores} from '@/server/stores';
import {isSuperAdmin} from '@/server/ai-settings';
import {ReportError} from '@/server/report-service';
import {json,failure,writeGuard,readJson} from '@/server/http';
import {billingTestConfiguration} from '@/server/billing-http';
import {prepareTestTranslation} from '@/server/final-service';

export async function POST(req:Request){
 try{
  const {owner,stores}=await authorizedStores({maintenance:false});
  if(!await isSuperAdmin(stores.db,owner))throw new ReportError(403,'forbidden');
  writeGuard(req);billingTestConfiguration(env);
  return json(await prepareTestTranslation(stores,owner,await readJson(req,2048),env));
 }catch(error){return failure(error)}
}
