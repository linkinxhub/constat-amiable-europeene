import {authorizedStores} from '@/server/stores';
import {submitFeedback} from '@/server/feedback-service';
import {failure,json,readJson,writeGuard} from '@/server/http';
export async function POST(req:Request){try{writeGuard(req);const {owner,stores}=await authorizedStores({maintenance:false});return json(await submitFeedback(stores.db,owner,await readJson(req,800000)),201)}catch(e){return failure(e)}}
