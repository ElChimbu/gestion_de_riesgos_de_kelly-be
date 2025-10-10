-- Add source tracking to operations so we can link back to external sources (e.g. fixed_operations)
ALTER TABLE operations
  ADD COLUMN IF NOT EXISTS source VARCHAR(50),
  ADD COLUMN IF NOT EXISTS source_id VARCHAR(255);

-- Add a unique index to prevent duplicating the same source record for the same user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'operations_source_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX operations_source_unique_idx ON operations (source, source_id, uid) WHERE source IS NOT NULL AND source_id IS NOT NULL;
  END IF;
END$$;
