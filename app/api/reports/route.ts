import {authorizedStores} from '@/server/stores';import {listReports} from '@/server/report-service';import {json,failure} from '@/server/http';
export const dynamic='force-dynamic';
export async function GET(){try{const {owner,stores}=await authorizedStores();return json({reports:await listReports(stores,owner)});}catch(e){return failure(e);}}
