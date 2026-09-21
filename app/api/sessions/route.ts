import {authorizedStores} from '@/server/stores';import {createSession,listSessions} from '@/server/session-service';import {json,failure,readJson,writeGuard} from '@/server/http';import {recordId,ReportError} from '@/server/report-service';
export async function POST(req:Request){try{const {owner,stores}=await authorizedStores();writeGuard(req);const input=await readJson(req);if(!recordId.safeParse(input?.reportId).success)throw new ReportError(400,'invalid');return json(await createSession(stores,owner,input.reportId));}catch(e){return failure(e)}}

export async function GET(){try{const {owner,stores}=await authorizedStores();return json({sessions:await listSessions(stores,owner)});}catch(e){return failure(e)}}
