import { env } from 'cloudflare:workers';
import { json, failure, readJson, writeGuard } from '@/server/http';
import { authorizedStores } from '@/server/stores';
import { issuePairing, validOpaque } from '@/server/mobile-pairing';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    writeGuard(request);
    const { owner, stores } = await authorizedStores({ maintenance: false });
    if (!validOpaque((env as unknown as Record<string, unknown>).ACCORDIA_MOBILE_GATEWAY_SECRET)) {
      return json({ error: 'unavailable' }, 503);
    }
    const body = await readJson(request, 1024, 5000);
    if (!body || Object.keys(body).length !== 2 ||
        body.confirm !== true || !validOpaque(body.challenge)) {
      return json({ error: 'invalid' }, 400);
    }
    // A verified visitor may pair before saving a first web report.
    await stores.db.prepare('INSERT INTO accounts (id, created_at) VALUES (?, ?) ON CONFLICT(id) DO NOTHING')
      .bind(owner, new Date().toISOString()).run();
    const pairing = await issuePairing(stores.db, owner, body.challenge);
    return pairing ? json(pairing) : json({ error: 'account_unavailable' }, 403);
  } catch (error) {
    return failure(error);
  }
}
