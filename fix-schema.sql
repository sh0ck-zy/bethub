-- Add workflow state columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_pulled boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_analyzed boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_priority text DEFAULT 'normal';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analyzed_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_is_pulled ON matches(is_pulled);
CREATE INDEX IF NOT EXISTS idx_matches_is_analyzed ON matches(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_matches_analysis_priority ON matches(analysis_priority);