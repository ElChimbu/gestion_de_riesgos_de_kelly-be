-- Rollback migration: remove FK constraints and users table
BEGIN;

ALTER TABLE operations DROP CONSTRAINT IF EXISTS fk_operations_user;
ALTER TABLE fixed_operations DROP CONSTRAINT IF EXISTS fk_fixed_operations_user;

DROP TABLE IF EXISTS users;

COMMIT;
