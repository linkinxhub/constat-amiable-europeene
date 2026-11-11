import { env } from 'cloudflare:workers';
import { failure, json, readJson } from '@/server/http';
import { listReports, readReport } from '@/server/report-service';
import { exchangePairing, revokeSession, sessionOwner, validGatewaySecret, validOpaque } from '@/server/mobile-pairing';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ segments: string[] }> };

async function authorizedGateway(request: Request) {
  return validGatewaySecret(
    (env as unknown as Record<string, unknown>).ACCORDIA_MOBILE_GATEWAY_SECRET,
    request.headers.get('x-accordia-mobile-gateway'),
  );
}

function bearer(request: Request) {
  return request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
}

export async function POST(request: Request, context: Context) {
  try {
    if (!await authorizedGateway(request)) return json({ error: 'unauthenticated' }, 401);
    if (!env.DB) return json({ error: 'unavailable' }, 503);
    const { segments } = await context.params;
    if (segments.length !== 1 || segments[0] !== 'session') return json({ error: 'not_found' }, 404);
    if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
      return json({ error: 'invalid' }, 415);
    }
    const body = await readJson(request, 1024, 5000);
    if (!body || Object.keys(body).length !== 2 ||
        !validOpaque(body.code) || !validOpaque(body.verifier)) return json({ error: 'invalid' }, 400);
    const session = await exchangePairing(env.DB, body.code, body.verifier);
    return session ? json(session) : json({ error: 'unauthenticated' }, 401);
  } catch (error) {
    return failure(error);
  }
}

export async function GET(request: Request, context: Context) {
  try {
    if (!await authorizedGateway(request)) return json({ error: 'unauthenticated' }, 401);
    if (!env.DB || !env.BUCKET) return json({ error: 'unavailable' }, 503);
    const { segments } = await context.params;
    if (segments[0] !== 'reports' || segments.length > 2) return json({ error: 'not_found' }, 404);
    const token = bearer(request);
    const owner = token ? await sessionOwner(env.DB, token) : null;
    if (!owner) return json({ error: 'unauthenticated' }, 401);
    const stores = { db: env.DB, bucket: env.BUCKET };
    if (segments.length === 2) return json(await readReport(stores, owner, segments[1]));
    return json({ reports: await listReports(stores, owner) });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    if (!await authorizedGateway(request)) return json({ error: 'unauthenticated' }, 401);
    if (!env.DB) return json({ error: 'unavailable' }, 503);
    const { segments } = await context.params;
    if (segments.length !== 1 || segments[0] !== 'session') return json({ error: 'not_found' }, 404);
    const token = bearer(request);
    if (!token) return json({ error: 'unauthenticated' }, 401);
    await revokeSession(env.DB, token);
    return json({ revoked: true });
  } catch (error) {
    return failure(error);
  }
}
