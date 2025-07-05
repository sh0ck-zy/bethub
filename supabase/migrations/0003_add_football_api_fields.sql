-- Add new fields to matches table for football API integration
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS home_team_id INTEGER,
ADD COLUMN IF NOT EXISTS away_team_id INTEGER,
ADD COLUMN IF NOT EXISTS competition_id INTEGER,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS score_home INTEGER,
ADD COLUMN IF NOT EXISTS score_away INTEGER,
ADD COLUMN IF NOT EXISTS events JSONB,
ADD COLUMN IF NOT EXISTS statistics JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_competition_id ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_country ON matches(country);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff_date ON matches(kickoff_utc);

-- Create teams table for team information
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  tla TEXT,
  country TEXT,
  founded INTEGER,
  venue TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitions table for league information
CREATE TABLE IF NOT EXISTS competitions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  type TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_home_team 
FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE matches 
ADD CONSTRAINT fk_matches_away_team 
FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE matches 
ADD CONSTRAINT fk_matches_competition 
FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE SET NULL;

-- Create indexes for teams and competitions
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country);
CREATE INDEX IF NOT EXISTS idx_competitions_name ON competitions(name);
CREATE INDEX IF NOT EXISTS idx_competitions_country ON competitions(country);

-- Add RLS policies for new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Teams are insertable by authenticated users" ON teams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Teams are updatable by authenticated users" ON teams
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Competitions policies
CREATE POLICY "Competitions are viewable by everyone" ON competitions
  FOR SELECT USING (true);

CREATE POLICY "Competitions are insertable by authenticated users" ON competitions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Competitions are updatable by authenticated users" ON competitions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add some sample data for testing
INSERT INTO teams (id, name, short_name, tla, country) VALUES
  (1, 'Arsenal', 'Arsenal', 'ARS', 'England'),
  (2, 'Chelsea', 'Chelsea', 'CHE', 'England'),
  (3, 'Manchester United', 'Man United', 'MUN', 'England'),
  (4, 'Liverpool', 'Liverpool', 'LIV', 'England'),
  (5, 'Manchester City', 'Man City', 'MCI', 'England'),
  (6, 'Barcelona', 'Barcelona', 'BAR', 'Spain'),
  (7, 'Real Madrid', 'Real Madrid', 'RMA', 'Spain'),
  (8, 'Bayern Munich', 'Bayern', 'BAY', 'Germany'),
  (9, 'Paris Saint-Germain', 'PSG', 'PSG', 'France'),
  (10, 'Juventus', 'Juventus', 'JUV', 'Italy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO competitions (id, name, country, type) VALUES
  (1, 'Premier League', 'England', 'LEAGUE'),
  (2, 'La Liga', 'Spain', 'LEAGUE'),
  (3, 'Bundesliga', 'Germany', 'LEAGUE'),
  (4, 'Ligue 1', 'France', 'LEAGUE'),
  (5, 'Serie A', 'Italy', 'LEAGUE'),
  (6, 'Champions League', 'Europe', 'CUP'),
  (7, 'Europa League', 'Europe', 'CUP')
ON CONFLICT (id) DO NOTHING; 