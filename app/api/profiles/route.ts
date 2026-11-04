import {authorizedStores} from '@/server/stores';
import {createProfile,listProfiles} from '@/server/profile-service';
import {json,failure,writeGuard,readJson} from '@/server/http';
export const dynamic='force-dynamic';
export async function GET(){try{const {owner,stores}=await authorizedStores();return json({profiles:await listProfiles(stores,owner)})}catch(e){return failure(e)}}
export async function POST(request:Request){try{const {owner,stores}=await authorizedStores();writeGuard(request);return json({profile:await createProfile(stores,owner,await readJson(request,20000))},201)}catch(e){return failure(e)}}
