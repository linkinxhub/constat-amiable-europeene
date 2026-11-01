import {env} from 'cloudflare:workers';
import {authorizedStores} from '@/server/stores';
import {resolveSketchConfig} from '@/server/ai-settings';
import {extractDocument,documentAccess} from '@/server/document-extraction';
import {json,failure,readJson,writeGuard} from '@/server/http';
export async function POST(req:Request){try{const {owner,stores}=await authorizedStores();writeGuard(req);const input=await readJson(req,4300000);return json(await extractDocument(stores,owner,input,await resolveSketchConfig(stores.db,env)));}catch(e){return failure(e)}}

export async function GET(){try{const {owner,stores}=await authorizedStores();return json(await documentAccess(stores,owner));}catch(e){return failure(e)}}
