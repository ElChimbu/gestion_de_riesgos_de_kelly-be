-- 006: Create users table and add FK constraints from operations and fixed_operations
BEGIN;

-- Create users table to store firebase_uid and basic info
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Backfill users from existing operations and fixed_operations uids
INSERT INTO users (firebase_uid)
  SELECT DISTINCT uid FROM operations WHERE uid IS NOT NULL AND uid <> ''
  ON CONFLICT (firebase_uid) DO NOTHING;

INSERT INTO users (firebase_uid)
  SELECT DISTINCT uid FROM fixed_operations WHERE uid IS NOT NULL AND uid <> ''
  ON CONFLICT (firebase_uid) DO NOTHING;

-- Ensure index on users.firebase_uid exists (unique index created by UNIQUE)

-- Add FK constraints referencing users(firebase_uid)
ALTER TABLE operations
  ADD CONSTRAINT fk_operations_user FOREIGN KEY (uid) REFERENCES users(firebase_uid);

ALTER TABLE fixed_operations
  ADD CONSTRAINT fk_fixed_operations_user FOREIGN KEY (uid) REFERENCES users(firebase_uid);

COMMIT;
