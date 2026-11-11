import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { createGateway } from './gateway.mjs';

const token = 'm'.repeat(43);

async function withGateway(fetchUpstream, run) {
  const server = createGateway({ siteOrigin: 'https://preview.example', siteToken: 'fixture', gatewaySecret: 'g'.repeat(43), fetchUpstream });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await run('http://127.0.0.1:' + server.address().port);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('rejects private reads without a mobile session and disallows mutations', async () => {
  await withGateway(async () => assert.fail('upstream must not be called'), async origin => {
    assert.equal((await fetch(origin + '/v1/reports')).status, 401);
    assert.equal((await fetch(origin + '/v1/reports', { method: 'DELETE' })).status, 404);
    assert.equal((await fetch(origin + '/v1/reports?owner=other')).status, 404);
  });
});

test('routes an authenticated read to the fixed origin with separate credentials', async () => {
  await withGateway(async (url, options) => {
    assert.equal(url, 'https://preview.example/api/mobile-gateway/reports/example_report_123');
    assert.equal(options.headers.Authorization, 'Bearer ' + token);
    assert.equal(options.headers['OAI-Sites-Authorization'], 'Bearer fixture');
    assert.equal(options.headers['x-accordia-mobile-gateway'], 'g'.repeat(43));
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers['oai-authenticated-user-id'], undefined);
    return Response.json({ report: { id: 'example' } });
  }, async origin => {
    const response = await fetch(origin + '/v1/reports/example_report_123', {
      headers: { Authorization: 'Bearer ' + token, 'oai-authenticated-user-id': 'ignored' },
    });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { report: { id: 'example' } });
  });
});

test('accepts only the pairing code and verifier and hides HTML failures', async () => {
  await withGateway(async (url, options) => {
    assert.ok(url.endsWith('/api/mobile-gateway/session'));
    assert.deepEqual(JSON.parse(options.body), { code: token, verifier: token });
    return new Response('<html>login</html>', { headers: { 'content-type': 'text/html' } });
  }, async origin => {
    const post = value => fetch(origin + '/v1/session', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(value),
    });
    assert.equal((await post({ code: token, verifier: token, owner: 'other' })).status, 400);
    const response = await post({ code: token, verifier: token });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'upstream_unavailable' });
  });
});

test('startup requires an explicit HTTPS origin with no path or credentials', () => {
  for (const siteOrigin of [undefined, 'http://example.com', 'https://user@example.com', 'https://example.com/path']) {
    assert.throws(
      () => createGateway({ siteOrigin, siteToken: 'fixture', gatewaySecret: 'g'.repeat(43) }),
      /ACCORDIA_SITE_ORIGIN/,
    );
  }
});

test('return page exposes no credentials and association requires a certificate', async () => {
  await withGateway(async () => assert.fail('upstream must not be called'), async origin => {
    const fallback = await fetch(origin + '/mobile-pairing/return');
    assert.equal(fallback.status, 200);
    assert.equal(fallback.headers.get('referrer-policy'), 'no-referrer');
    assert.equal((await fetch(origin + '/.well-known/assetlinks.json')).status, 404);
  });
});
