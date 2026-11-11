import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { digest, exchangePairing, issuePairing, revokeSession, sessionOwner, validGatewaySecret } from '../server/mobile-pairing.ts';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec("CREATE TABLE accounts(id TEXT PRIMARY KEY, status TEXT); INSERT INTO accounts VALUES ('a','active'), ('b','active');");
  sqlite.exec(readFileSync(new URL('../drizzle/0023_cuddly_captain_stacy.sql', import.meta.url), 'utf8'));
  const db = { prepare(sql) {
    const statement = sqlite.prepare(sql);
    return { bind(...values) {
      return {
        async run() { return { meta: { changes: statement.run(...values).changes } }; },
        async first() { return statement.get(...values) ?? null; },
      };
    } };
  } };
  return { sqlite, db };
}

test('only the matching verifier can consume a code and link the correct account', async () => {
  const { sqlite, db } = database();
  const verifier = 'v'.repeat(43);
  const challenge = await digest(verifier);
  const a = await issuePairing(db, 'a', challenge, 1000);
  const b = await issuePairing(db, 'b', challenge, 1000);
  assert.equal(await exchangePairing(db, a.code, 'x'.repeat(43), 1001), null);
  const exchanges = await Promise.all([
    exchangePairing(db, a.code, verifier, 1001),
    exchangePairing(db, a.code, verifier, 1001),
  ]);
  assert.equal(exchanges.filter(Boolean).length, 1);
  const tokenA = exchanges.find(Boolean).token;
  const tokenB = (await exchangePairing(db, b.code, verifier, 1001)).token;
  assert.equal(await sessionOwner(db, tokenA, 1002), 'a');
  assert.equal(await sessionOwner(db, tokenB, 1002), 'b');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM mobile_pairings WHERE code_hash = ? OR session_hash = ?').get(a.code, tokenA).n, 0);
  await revokeSession(db, tokenA);
  assert.equal(await sessionOwner(db, tokenA, 1002), null);
  assert.equal(await sessionOwner(db, tokenB, 1002), 'b');
});

test('expired codes, expired sessions, and unavailable accounts are rejected', async () => {
  const { sqlite, db } = database();
  const verifier = 'v'.repeat(43);
  const challenge = await digest(verifier);
  assert.equal(await issuePairing(db, 'unknown', challenge, 1000), null);
  const expired = await issuePairing(db, 'a', challenge, 1000);
  assert.equal(await exchangePairing(db, expired.code, verifier, expired.expiresAt), null);
  const a = await issuePairing(db, 'a', challenge, 1000);
  const session = await exchangePairing(db, a.code, verifier, 1001);
  assert.equal(await sessionOwner(db, session.token, session.expiresAt), null);
  sqlite.exec("UPDATE accounts SET status = 'suspended' WHERE id = 'a'");
  assert.equal(await sessionOwner(db, session.token, 1002), null);
  assert.equal(await issuePairing(db, 'a', challenge, 1002), null);
});

test('the gateway secret is mandatory and compared against the configured value', async () => {
  const key = 'g'.repeat(43);
  assert.equal(await validGatewaySecret(undefined, key), false);
  assert.equal(await validGatewaySecret(key, null), false);
  assert.equal(await validGatewaySecret(key, 'h'.repeat(43)), false);
  assert.equal(await validGatewaySecret(key, key), true);
});
