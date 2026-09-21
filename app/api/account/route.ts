import {authorizedStores} from '@/server/stores';import {accountInfo,BUDGET} from '@/server/report-service';import {recoverStorage} from '@/server/object-storage';import {json,failure,writeGuard} from '@/server/http';
export const dynamic='force-dynamic';
export async function GET(){try{const {owner,stores}=await authorizedStores();return json({account:await accountInfo(stores.db,owner),budget:BUDGET});}catch(e){return failure(e);}}

export async function POST(request:Request){try{writeGuard(request);const {owner,stores}=await authorizedStores();const recovery=await recoverStorage(stores,owner);return json({recovery,account:await accountInfo(stores.db,owner),budget:BUDGET});}catch(e){return failure(e);}}
