-- BetHub Database Schema Enhancement
-- Phase 1: Add admin workflow capabilities to existing schema

-- Add workflow state columns to existing matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_pulled boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_analyzed boolean DEFAULT false; 
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'none' CHECK (analysis_status IN ('none', 'pending', 'completed', 'failed'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analysis_priority text DEFAULT 'normal' CHECK (analysis_priority IN ('low', 'normal', 'high'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS analyzed_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Add additional metadata columns if not exists
ALTER TABLE matches ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'football-data' CHECK (data_source IN ('football-data', 'api-sports', 'manual'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_minute integer;

-- Add indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_matches_is_pulled ON matches(is_pulled);
CREATE INDEX IF NOT EXISTS idx_matches_is_analyzed ON matches(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_matches_is_published ON matches(is_published);
CREATE INDEX IF NOT EXISTS idx_matches_analysis_status ON matches(analysis_status);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_data_source ON matches(data_source);

-- Create dedicated analysis table (replacing analysis_snapshots for better structure)
CREATE TABLE IF NOT EXISTS analysis (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  -- AI-generated content
  prediction text NOT NULL,
  confidence_score decimal(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  key_insights text[] NOT NULL DEFAULT '{}',
  
  -- Detailed analysis (JSON for flexibility)
  statistical_analysis jsonb NOT NULL DEFAULT '{}',
  
  -- Metadata
  ai_model_version text NOT NULL DEFAULT 'dummy-v1',
  processing_time_ms integer NOT NULL DEFAULT 0,
  analysis_quality_score integer DEFAULT 85 CHECK (analysis_quality_score >= 0 AND analysis_quality_score <= 100),
  
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(match_id) -- One analysis per match for now
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_analysis_match_id ON analysis(match_id);

-- Simple admin user tracking
CREATE TABLE IF NOT EXISTS admin_users (
  id text PRIMARY KEY, -- Matches Supabase auth.users.id
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  
  -- Activity tracking
  last_login_at timestamptz,
  matches_imported_count integer DEFAULT 0,
  matches_published_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint on external_id + data_source for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_external_unique ON matches(external_id, data_source) WHERE external_id IS NOT NULL;

-- Update existing matches to have proper workflow states (for development)
UPDATE matches SET 
  is_pulled = true,
  is_analyzed = false,
  is_published = false,
  analysis_status = 'none',
  analysis_priority = 'normal',
  data_source = 'football-data'
WHERE is_pulled IS NULL OR is_pulled = false;

-- Add comment for documentation
COMMENT ON TABLE analysis IS 'AI-generated match analysis with dummy responses for development';
COMMENT ON TABLE admin_users IS 'Admin user management and activity tracking';