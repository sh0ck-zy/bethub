-- Add teams and leagues tables for football API integration
-- This migration creates the foundation for real football data

-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id integer UNIQUE,
  name text NOT NULL,
  short_name text,
  league text,
  logo_url text,
  country text,
  founded integer,
  venue text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leagues table
CREATE TABLE leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id integer UNIQUE,
  name text NOT NULL,
  country text,
  logo_url text,
  season text,
  type text CHECK (type IN ('league', 'cup', 'international')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key references to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id uuid REFERENCES teams(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id uuid REFERENCES teams(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES leagues(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON teams(external_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_league ON teams(league);
CREATE INDEX IF NOT EXISTS idx_leagues_external_id ON leagues(external_id);
CREATE INDEX IF NOT EXISTS idx_leagues_name ON leagues(name);
CREATE INDEX IF NOT EXISTS idx_leagues_country ON leagues(country);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 