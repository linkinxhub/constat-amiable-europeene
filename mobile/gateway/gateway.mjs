import { createServer } from 'node:http';

const upstream = 'https://accordia-constat.adil-btp.chatgpt.site';
const credential = /^[A-Za-z0-9_-]{43}$/;
const reportPath = /^\/v1\/reports(?:\/[A-Za-z0-9-]{1,100})?$/;
const maxResponseBytes = 12 * 1024 * 1024;

async function boundedBody(stream, limit) {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of stream) {
    bytes += chunk.length;
    if (bytes > limit) throw new RangeError('body_limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

function fail(response, status, error) {
  send(response, status, JSON.stringify({ error }));
}

export function createGateway({ siteToken, fetchUpstream = fetch }) {
  if (typeof siteToken !== 'string' || !siteToken || /\s/.test(siteToken)) {
    throw new Error('ACCORDIA_SITE_SERVICE_TOKEN is required');
  }

  return createServer({ requestTimeout: 10000, headersTimeout: 5000 }, async (request, response) => {
    const path = request.url ?? '';
    if (request.method === 'GET' && path === '/health') {
      return send(response, 200, '{"status":"ready"}');
    }
    const exchange = request.method === 'POST' && path === '/v1/session';
    const read = request.method === 'GET' && reportPath.test(path);
    if (!exchange && !read) return fail(response, 404, 'not_found');

    const headers = {
      Accept: 'application/json',
      'OAI-Sites-Authorization': 'Bearer ' + siteToken,
    };
    let body;
    if (exchange) {
      if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
        return fail(response, 415, 'unsupported_type');
      }
      try {
        const data = JSON.parse(await boundedBody(request, 1024));
        if (!data || Object.keys(data).length !== 2 ||
            typeof data.code !== 'string' || !credential.test(data.code) ||
            typeof data.verifier !== 'string' || !credential.test(data.verifier)) {
          return fail(response, 400, 'invalid_request');
        }
        body = JSON.stringify({ code: data.code, verifier: data.verifier });
        headers['Content-Type'] = 'application/json';
      } catch (error) {
        return fail(response, error instanceof RangeError ? 413 : 400, 'invalid_request');
      }
    } else {
      const token = request.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
      if (!token) return fail(response, 401, 'unauthenticated');
      headers.Authorization = 'Bearer ' + token;
    }

    try {
      const route = '/api/mobile-gateway' + path.slice(3);
      const result = await fetchUpstream(upstream + route, {
        method: request.method,
        headers,
        body,
        redirect: 'error',
        signal: AbortSignal.timeout(12000),
      });
      if (!result.ok) {
        await result.body?.cancel();
        if ([400, 401, 403, 409, 429].includes(result.status)) {
          return fail(response, result.status, 'request_refused');
        }
        if (result.status === 404 && read && path !== '/v1/reports') {
          return fail(response, 404, 'not_found');
        }
        return fail(response, 502, 'upstream_unavailable');
      }
      if (result.headers.get('content-type')?.split(';')[0] !== 'application/json') {
        await result.body?.cancel();
        return fail(response, 502, 'upstream_unavailable');
      }
      const payload = JSON.parse(await boundedBody(result.body, maxResponseBytes));
      return send(response, result.status, JSON.stringify(payload));
    } catch {
      return fail(response, 502, 'upstream_unavailable');
    }
  });
}
