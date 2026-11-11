CREATE TABLE mobile_pairings (
  code_hash TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES accounts(id),
  challenge TEXT NOT NULL,
  code_expires_at INTEGER NOT NULL,
  session_hash TEXT UNIQUE,
  session_expires_at INTEGER
);

CREATE INDEX mobile_pairings_expiry
  ON mobile_pairings(COALESCE(session_expires_at, code_expires_at));
