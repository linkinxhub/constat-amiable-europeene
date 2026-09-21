import {tryRetentionMaintenance} from './retention-maintenance';
import {active} from './report-service';
import {env} from 'cloudflare:workers';import {getChatGPTUser} from '../app/chatgpt-auth';import {ReportError,type Stores} from './report-service';
export async function authorizedStores(options:{maintenance?:boolean}={}):Promise<{owner:string,stores:Stores}>{const user=await getChatGPTUser();if(!user)throw new ReportError(401,'unauthenticated');if(!env.DB||!env.BUCKET)throw new ReportError(503,'unavailable');const stores={db:env.DB,bucket:env.BUCKET};await active(stores.db,user.userId);if(options.maintenance!==false)await tryRetentionMaintenance(stores);return {owner:user.userId,stores};}
