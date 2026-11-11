const opaque = /^[A-Za-z0-9_-]{43}$/;
const codeLifetime = 5 * 60 * 1000;
const sessionLifetime = 30 * 60 * 1000;

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export function validOpaque(value: unknown): value is string {
  return typeof value === 'string' && value.length === 43 && opaque.test(value);
}

export async function digest(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return encode(new Uint8Array(hash));
}

function randomToken() {
  return encode(crypto.getRandomValues(new Uint8Array(32)));
}

export async function issuePairing(db: D1Database, owner: string, challenge: string, now = Date.now()) {
  const code = randomToken();
  const expiresAt = now + codeLifetime;
  await db.prepare(`DELETE FROM mobile_pairings WHERE code_hash IN (
    SELECT code_hash FROM mobile_pairings
    WHERE COALESCE(session_expires_at, code_expires_at) <= ? LIMIT 100
  )`).bind(now).run();
  const result = await db.prepare(`INSERT INTO mobile_pairings
    (code_hash, owner_id, challenge, code_expires_at)
    SELECT ?, id, ?, ? FROM accounts WHERE id = ? AND status = 'active'
      AND (SELECT COUNT(*) FROM mobile_pairings
        WHERE owner_id = accounts.id AND COALESCE(session_expires_at, code_expires_at) > ?) < 8`)
    .bind(await digest(code), challenge, expiresAt, owner, now).run();
  return result.meta.changes === 1 ? { code, expiresAt } : null;
}

export async function exchangePairing(db: D1Database, code: string, verifier: string, now = Date.now()) {
  const token = randomToken();
  const expiresAt = now + sessionLifetime;
  // The same statement checks the verifier and consumes the code.
  const result = await db.prepare(`UPDATE mobile_pairings
    SET session_hash = ?, session_expires_at = ?
    WHERE code_hash = ? AND challenge = ? AND code_expires_at > ?
      AND session_hash IS NULL AND EXISTS (
        SELECT 1 FROM accounts WHERE id = owner_id AND status = 'active'
      )`).bind(await digest(token), expiresAt, await digest(code), await digest(verifier), now).run();
  return result.meta.changes === 1 ? { token, expiresAt } : null;
}

export async function sessionOwner(db: D1Database, token: string, now = Date.now()) {
  const session = await db.prepare(`SELECT pairing.owner_id FROM mobile_pairings pairing
    JOIN accounts ON accounts.id = pairing.owner_id AND accounts.status = 'active'
    WHERE pairing.session_hash = ? AND pairing.session_expires_at > ?`)
    .bind(await digest(token), now).first<{ owner_id: string }>();
  return session?.owner_id ?? null;
}

export async function revokeSession(db: D1Database, token: string) {
  await db.prepare('DELETE FROM mobile_pairings WHERE session_hash = ?')
    .bind(await digest(token)).run();
}

export async function validGatewaySecret(expected: unknown, presented: string | null) {
  if (!validOpaque(expected) || !validOpaque(presented)) return false;
  const a = await digest(expected);
  const b = await digest(presented);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
