import {env} from 'cloudflare:workers';
import {authorizedStores} from '@/server/stores';
import {isSuperAdmin,resolveSketchConfig} from '@/server/ai-settings';
import {ReportError} from '@/server/report-service';
import {json,failure,writeGuard,readJson} from '@/server/http';
import {billingTestConfiguration} from '@/server/billing-http';
import {generateTestSketch} from '@/server/sketch-service';

export async function POST(req:Request){
 try{
  const {owner,stores}=await authorizedStores({maintenance:false});
  if(!await isSuperAdmin(stores.db,owner))throw new ReportError(403,'forbidden');
  writeGuard(req);
  billingTestConfiguration(env);
  const input=await readJson(req,1024);
  return json(await generateTestSketch(stores,owner,input,await resolveSketchConfig(stores.db,env)));
 }catch(error){return failure(error)}
}
