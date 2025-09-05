-- Add missing columns that are being lost during data sync
-- These columns are critical for proper data display and workflow management

-- Add logo/image columns for proper display
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_logo text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_logo text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_logo text;

-- Add workflow state columns that were missing
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_pulled boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_analyzed boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_priority text DEFAULT 'normal';

-- Add match metadata that was missing
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_minute integer;

-- Add constraint for analysis_priority
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_analysis_priority_check;
ALTER TABLE matches ADD CONSTRAINT matches_analysis_priority_check 
  CHECK (analysis_priority IN ('low', 'normal', 'high'));

-- Add indexes for the new columns for better performance
CREATE INDEX IF NOT EXISTS idx_matches_is_pulled ON matches(is_pulled);
CREATE INDEX IF NOT EXISTS idx_matches_is_analyzed ON matches(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_matches_analysis_priority ON matches(analysis_priority);

-- Update existing matches to have proper workflow states
UPDATE matches SET 
  is_pulled = true,
  is_analyzed = false,
  analysis_priority = 'normal'
WHERE is_pulled IS NULL;