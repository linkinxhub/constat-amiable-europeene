// Test identity headers exist only in this isolated worker fixture.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createGateway } from '../mobile/gateway/gateway.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { digest } from '../server/mobile-pairing.ts';

const require = createRequire(import.meta.url);
const wrangler = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = wrangler('miniflare');
const secret = 's'.repeat(43);
const worker = new Miniflare({
  modules: [
    { type: 'ESModule', path: resolve('dist/server/index.js') },
    ...readdirSync('dist/server', { recursive: true })
      .filter(p => p.endsWith('.js') && p !== 'index.js')
      .map(p => ({ type: 'ESModule', path: resolve('dist/server', p) })),
  ],
  modulesRoot: resolve('dist/server'),
  modulesRules: [{ type: 'ESModule', include: ['**/*.js', '**/*.mjs'], fallthrough: true }],
  compatibilityDate: '2026-05-15',
  compatibilityFlags: ['nodejs_compat'],
  cf: false,
  bindings: { ACCORDIA_MOBILE_GATEWAY_SECRET: secret },
  d1Databases: { DB: 'mobile-preview' },
  r2Buckets: ['BUCKET'],
});

const relay = createGateway({
  siteOrigin: 'https://preview.example',
  siteToken: 'test-service-token',
  gatewaySecret: secret,
  fetchUpstream(url, options) {
    const target = new URL(url);
    assert.equal(target.origin, 'https://preview.example');
    return worker.dispatchFetch('http://localhost' + target.pathname, options);
  },
});
relay.listen(0, '127.0.0.1');
await once(relay, 'listening');
const mobile = 'http://127.0.0.1:' + relay.address().port;

try {
  const db = await worker.getD1Database('DB');
  const migrations = readdirSync('drizzle').filter(file => file.endsWith('.sql')).sort();
  for (const file of migrations) {
    const statements = readFileSync(resolve('drizzle', file), 'utf8').split('--> statement-breakpoint');
    for (const sql of statements) if (sql.trim()) await db.prepare(sql.trim()).run();
  }
  for (const account of ['preview-a', 'preview-b']) {
    await db.prepare('INSERT INTO accounts(id,created_at) VALUES (?,?)').bind(account,'2026-11-11').run();
    await db.prepare(`INSERT INTO reports(owner_id,id,revision,object_key,title,accident_date,updated_at)
      VALUES (?,?,1,?,?,?,?)`).bind(account, account + '-report-00000000', 'fixture', account, '', '2026-11-11').run();
  }
  const base = 'http://localhost';
  const web = { 'Content-Type': 'application/json', Origin: base, 'x-accordia-request': '1' };
  const issue = async (id, verifier) => {
    const response = await worker.dispatchFetch(base + '/api/mobile-pairing', {
      method: 'POST',
      headers: { ...web, 'oai-authenticated-user-id': id, 'oai-authenticated-user-email': id + '@example.invalid' },
      body: JSON.stringify({ confirm: true, challenge: await digest(verifier) }),
    });
    assert.equal(response.status, 200);
    return (await response.json()).code;
  };
  const exchange = (code, verifier) => fetch(mobile + '/v1/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, verifier }),
  });
  const list = token => fetch(mobile + '/v1/reports', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const first = 'a'.repeat(43);
  const second = 'b'.repeat(43);
  const codeA = await issue('preview-a', first);
  const codeB = await issue('preview-b', second);
  assert.equal((await exchange(codeA, second)).status, 401);
  const sessionA = await (await exchange(codeA, first)).json();
  const sessionB = await (await exchange(codeB, second)).json();
  assert.equal((await exchange(codeA, first)).status, 401);
  for (const [session, own, foreign] of [[sessionA, 'preview-a', 'preview-b'], [sessionB, 'preview-b', 'preview-a']]) {
    const response = await list(session.token);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual((await response.json()).reports.map(r => r.title), [own]);
    const denied = await fetch(mobile + '/v1/reports/' + foreign + '-report-00000000', {
      headers: { Authorization: 'Bearer ' + session.token },
    });
    assert.equal(denied.status, 404);
  }
  const noGateway = await worker.dispatchFetch(base + '/api/mobile-gateway/reports', {
    headers: { Authorization: 'Bearer ' + sessionA.token },
  });
  assert.equal(noGateway.status, 401);
  const revoke = await fetch(mobile + '/v1/session', {
    method: 'DELETE', headers: { Authorization: 'Bearer ' + sessionA.token },
  });
  assert.equal(revoke.status, 200);
  assert.equal((await list(sessionA.token)).status, 401);
  assert.equal((await list(sessionB.token)).status, 200);
  console.log('Compiled routes: migrations, pairing and account isolation verified');
} finally {
  await new Promise(resolve => relay.close(resolve));
  await worker.dispose();
}
