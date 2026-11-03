import {authorizedStores} from '@/server/stores';
import {readMobileAdmin,saveMobileSettings} from '@/server/mobile-settings';
import {json,failure,readJson,writeGuard} from '@/server/http';
export async function GET(){try{const {owner,stores}=await authorizedStores({maintenance:false});return json(await readMobileAdmin(stores.db,owner));}catch(e){return failure(e)}}
export async function PUT(req:Request){try{const {owner,stores}=await authorizedStores({maintenance:false});writeGuard(req);return json(await saveMobileSettings(stores.db,owner,await readJson(req,4096)));}catch(e){return failure(e)}}
