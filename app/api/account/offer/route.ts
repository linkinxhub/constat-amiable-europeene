import {authorizedStores} from '@/server/stores';import {readOffer,saveOffer} from '@/server/offer-service';import {json,failure,readJson,writeGuard} from '@/server/http';
export async function GET(){try{const {owner,stores}=await authorizedStores();return json(await readOffer(stores.db,owner));}catch(e){return failure(e)}}
export async function PUT(req:Request){try{const {owner,stores}=await authorizedStores();writeGuard(req);return json(await saveOffer(stores.db,owner,await readJson(req,1024)));}catch(e){return failure(e)}}
