-- Rollback for 004: remove created_at and type columns and index
ALTER TABLE operations DROP COLUMN IF EXISTS created_at;
ALTER TABLE operations DROP COLUMN IF EXISTS type;
DROP INDEX IF EXISTS idx_operations_created_at;
