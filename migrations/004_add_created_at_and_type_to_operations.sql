-- Add created_at timestamp and type column to operations
ALTER TABLE operations
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE operations
  ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'kelly';

-- index for faster ordering by date
CREATE INDEX IF NOT EXISTS idx_operations_created_at ON operations(created_at);
