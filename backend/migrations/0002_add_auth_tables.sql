BEGIN;

-- users table to store login credentials
CREATE TABLE IF NOT EXISTS users (
  user_id         SERIAL PRIMARY KEY,
  name            VARCHAR NOT NULL,
  email           VARCHAR NOT NULL UNIQUE,
  password_hash   VARCHAR NOT NULL,
  role            VARCHAR NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- refresh_tokens table for managing user sessions
CREATE TABLE IF NOT EXISTS refresh_token (
  token_id    SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token       VARCHAR NOT NULL UNIQUE,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_token (user_id);

COMMIT;