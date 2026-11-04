import {authorizedStores} from '@/server/stores';
import {exportReportData,requestReportDeletion} from '@/server/report-data-service';
import {json,failure,writeGuard,readJson} from '@/server/http';
export const dynamic='force-dynamic';
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,{params}:Context){try{const {owner,stores}=await authorizedStores();return json(await exportReportData(stores,owner,(await params).id))}catch(e){return failure(e)}}
export async function DELETE(request:Request,{params}:Context){try{const {owner,stores}=await authorizedStores({maintenance:false});writeGuard(request);return json(await requestReportDeletion(stores,owner,(await params).id,await readJson(request,1000)))}catch(e){return failure(e)}}
