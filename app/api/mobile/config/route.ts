import {env} from 'cloudflare:workers';
import {readPublishedMobile} from '@/server/mobile-settings';
import {json,failure} from '@/server/http';
import {ReportError} from '@/server/report-service';
// Presentation only. Sites access policy still applies before this route.
export async function GET(){try{if(!env.DB)throw new ReportError(503,'unavailable');return json(await readPublishedMobile(env.DB));}catch(e){return failure(e)}}
