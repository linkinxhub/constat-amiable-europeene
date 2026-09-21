import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {authorizedStores} from '@/server/stores';
import {readAiSettings,saveAiSettings,testAiConnection} from '@/server/ai-settings';
import {json,failure,readJson,writeGuard} from '@/server/http';
import {ReportError} from '@/server/report-service';
export async function GET(){try{const {owner,stores}=await authorizedStores();return json(await readAiSettings(stores.db,owner,env));}catch(e){return failure(e)}}
export async function PUT(req:Request){try{const {owner,stores}=await authorizedStores();writeGuard(req);return json(await saveAiSettings(stores.db,owner,await readJson(req,4096),env));}catch(e){return failure(e)}}
export async function POST(req:Request){try{const {owner,stores}=await authorizedStores();writeGuard(req);const data=z.object({revision:z.number().int().nonnegative()}).strict().safeParse(await readJson(req,4096));if(!data.success)throw new ReportError(400,'invalid');return json(await testAiConnection(stores.db,owner,data.data.revision,env));}catch(e){return failure(e)}}
