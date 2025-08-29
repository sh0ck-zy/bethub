-- Fix external_id column type in matches table
-- The column should be text to handle Football-Data.org string IDs

-- Drop the existing column if it exists as integer
ALTER TABLE matches DROP COLUMN IF EXISTS external_id;

-- Add it back as text
ALTER TABLE matches ADD COLUMN external_id text;

-- Add unique index for external_id and data_source combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_external_id_data_source ON matches(external_id, data_source);

-- Add analysis status columns that are missing
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'none';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_data jsonb;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE matches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add constraint to ensure valid analysis status values
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_analysis_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_analysis_status_check 
  CHECK (analysis_status IN ('none', 'pending', 'completed', 'failed'));

-- Add indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_matches_analysis_status ON matches(analysis_status);
CREATE INDEX IF NOT EXISTS idx_matches_is_published ON matches(is_published);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);