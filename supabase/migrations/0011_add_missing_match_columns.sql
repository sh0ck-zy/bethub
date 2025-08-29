-- Add missing columns to matches table for data sync compatibility
-- These columns are expected by the enhanced data sync service

-- Add venue column
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue text;

-- Add referee column
ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee text;

-- Add score columns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_score integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_score integer;

-- Add additional match metadata columns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS competition_id text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS season text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matchday integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name text;

-- Add external API reference columns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'internal';

-- Add relationship columns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id uuid REFERENCES teams(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id uuid REFERENCES teams(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES leagues(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_data_source ON matches(data_source);
CREATE INDEX IF NOT EXISTS idx_matches_competition_id ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff_utc ON matches(kickoff_utc);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);

-- Update existing matches to have better default values
UPDATE matches SET data_source = 'manual' WHERE data_source IS NULL;

-- Add constraint to ensure valid status values
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
  CHECK (status IN ('PRE', 'LIVE', 'FT', 'HT', 'PAUSED', 'POSTPONED', 'CANCELLED'));

-- Add constraint to ensure valid data source values
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_data_source_check;
ALTER TABLE matches ADD CONSTRAINT matches_data_source_check 
  CHECK (data_source IN ('internal', 'manual', 'football-data', 'sports-db', 'multi-source')); 