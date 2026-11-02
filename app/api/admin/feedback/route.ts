import {z} from 'zod';
import {authorizedStores} from '@/server/stores';
import {listFeedback,readFeedback,resolveFeedback} from '@/server/feedback-service';
import {failure,json,readJson,writeGuard} from '@/server/http';
import {ReportError} from '@/server/report-service';
export async function GET(req:Request){try{const {owner,stores}=await authorizedStores({maintenance:false}),id=new URL(req.url).searchParams.get('id');return json(id?await readFeedback(stores.db,owner,id):await listFeedback(stores.db,owner,Number(new URL(req.url).searchParams.get('offset')||0)))}catch(e){return failure(e)}}
export async function PATCH(req:Request){try{writeGuard(req);const {owner,stores}=await authorizedStores({maintenance:false});const p=z.object({id:z.string().uuid(),resolved:z.boolean()}).strict().safeParse(await readJson(req,1024));if(!p.success)throw new ReportError(400,'invalid');return json(await resolveFeedback(stores.db,owner,p.data.id,p.data.resolved))}catch(e){return failure(e)}}
