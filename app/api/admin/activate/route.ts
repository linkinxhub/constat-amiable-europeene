import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {authorizedStores} from '@/server/stores';
import {activateAdmin} from '@/server/ai-settings';
import {json,failure,readJson,writeGuard} from '@/server/http';
import {ReportError} from '@/server/report-service';
export async function POST(req:Request){try{const {owner,stores}=await authorizedStores();writeGuard(req);const data=z.object({code:z.string().max(100)}).strict().safeParse(await readJson(req,4096));if(!data.success)throw new ReportError(400,'invalid');return json(await activateAdmin(stores.db,owner,data.data.code,env));}catch(e){return failure(e)}}
