import {authorizedStores} from '@/server/stores';
import {deleteProfile} from '@/server/profile-service';
import {ReportError} from '@/server/report-service';
import {json,failure,writeGuard,readJson} from '@/server/http';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{const {owner,stores}=await authorizedStores();writeGuard(request);if(!z.object({confirm:z.literal(true)}).strict().safeParse(await readJson(request,1000)).success)throw new ReportError(400,'invalid');return json(await deleteProfile(stores,owner,(await params).id))}catch(e){return failure(e)}}
