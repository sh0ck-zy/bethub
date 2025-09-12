-- CRITICAL SCHEMA FIX: Add missing columns to matches table
-- Run this in your Supabase SQL Editor to fix the competition_id error

-- First, let's check the current structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'matches' 
-- ORDER BY ordinal_position;

-- Add all missing columns with proper types and defaults
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_score integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_score integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS competition_id text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS season text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matchday integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'internal';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id uuid;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id uuid;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id uuid;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_logo text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_logo text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_logo text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_pulled boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_analyzed boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'none';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_priority text DEFAULT 'normal';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_minute integer;

-- Add timestamp columns if they don't exist
ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE matches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing matches to have proper default values
UPDATE matches SET 
  data_source = COALESCE(data_source, 'manual'),
  is_pulled = COALESCE(is_pulled, true),
  is_analyzed = COALESCE(is_analyzed, false),
  is_published = COALESCE(is_published, false),
  analysis_status = COALESCE(analysis_status, 'none'),
  analysis_priority = COALESCE(analysis_priority, 'normal'),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE 
  data_source IS NULL OR 
  is_pulled IS NULL OR 
  is_analyzed IS NULL OR 
  is_published IS NULL OR
  analysis_status IS NULL OR
  analysis_priority IS NULL OR
  created_at IS NULL OR
  updated_at IS NULL;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_data_source ON matches(data_source);
CREATE INDEX IF NOT EXISTS idx_matches_competition_id ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff_utc ON matches(kickoff_utc);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_is_published ON matches(is_published);
CREATE INDEX IF NOT EXISTS idx_matches_is_analyzed ON matches(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_matches_analysis_priority ON matches(analysis_priority);

-- Add constraints for data integrity
DO $$ 
BEGIN
  -- Status constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'matches_status_check' 
                 AND table_name = 'matches') THEN
    ALTER TABLE matches ADD CONSTRAINT matches_status_check 
      CHECK (status IN ('PRE', 'LIVE', 'FT', 'HT', 'PAUSED', 'POSTPONED', 'CANCELLED'));
  END IF;

  -- Data source constraint  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'matches_data_source_check' 
                 AND table_name = 'matches') THEN
    ALTER TABLE matches ADD CONSTRAINT matches_data_source_check 
      CHECK (data_source IN ('internal', 'manual', 'football-data', 'sports-db', 'multi-source'));
  END IF;

  -- Analysis priority constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'matches_analysis_priority_check' 
                 AND table_name = 'matches') THEN
    ALTER TABLE matches ADD CONSTRAINT matches_analysis_priority_check 
      CHECK (analysis_priority IN ('low', 'normal', 'high'));
  END IF;

  -- Analysis status constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'matches_analysis_status_check' 
                 AND table_name = 'matches') THEN
    ALTER TABLE matches ADD CONSTRAINT matches_analysis_status_check 
      CHECK (analysis_status IN ('none', 'pending', 'completed', 'failed'));
  END IF;
END $$;

-- Add unique constraint for external_id + data_source to prevent API duplicates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'matches_external_unique' 
                 AND table_name = 'matches') THEN
    ALTER TABLE matches ADD CONSTRAINT matches_external_unique 
      UNIQUE (external_id, data_source);
  END IF;
EXCEPTION
  WHEN others THEN
    -- Handle case where constraint already exists or data conflicts
    RAISE NOTICE 'Could not add unique constraint - may already exist or have conflicting data';
END $$;

-- Verify the migration worked
SELECT 
  'MIGRATION VERIFICATION' as status,
  COUNT(*) as total_matches,
  COUNT(competition_id) as matches_with_competition_id,
  COUNT(DISTINCT data_source) as data_sources,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_matches
FROM matches;

-- Show the new schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;