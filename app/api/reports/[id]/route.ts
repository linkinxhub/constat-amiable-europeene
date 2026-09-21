import {authorizedStores} from '@/server/stores';import {readReport,writeReport,ReportError} from '@/server/report-service';import {json,failure,writeGuard,readJson} from '@/server/http';
export const dynamic='force-dynamic';
type Context={params:Promise<{id:string}>};
export async function GET(_req:Request,{params}:Context){try{const {owner,stores}=await authorizedStores();return json(await readReport(stores,owner,(await params).id));}catch(e){return failure(e);}}
export async function PUT(req:Request,{params}:Context){try{const {owner,stores}=await authorizedStores();writeGuard(req);if(await stores.db.prepare('SELECT id FROM shared_sessions WHERE owner_id = ? AND report_id = ?').bind(owner,(await params).id).first())throw new ReportError(409,'shared_session');return json(await writeReport(stores,owner,(await params).id,await readJson(req)));}catch(e){return failure(e);}}
