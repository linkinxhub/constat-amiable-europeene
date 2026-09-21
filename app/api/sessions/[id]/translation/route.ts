import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {authorizedStores} from '@/server/stores';
import {translationState,consentTranslation} from '@/server/translation-service';
import {json,failure,readJson,writeGuard} from '@/server/http';
import {ReportError} from '@/server/report-service';
type C={params:Promise<{id:string}>};
export async function GET(req:Request,{params}:C){try{const {owner,stores}=await authorizedStores();return json(await translationState(stores,owner,(await params).id,env));}catch(e){return failure(e)}}
export async function POST(req:Request,{params}:C){try{const {owner,stores}=await authorizedStores();writeGuard(req);const data=z.object({revision:z.number().int().positive(),allow:z.boolean()}).strict().safeParse(await readJson(req,4096));if(!data.success)throw new ReportError(400,'invalid');return json(await consentTranslation(stores,owner,(await params).id,data.data.revision,data.data.allow));}catch(e){return failure(e)}}
