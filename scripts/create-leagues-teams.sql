-- Create leagues and teams tables for catalog
-- Run this in your Supabase SQL Editor

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
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
CREATE TABLE IF NOT EXISTS leagues (
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

-- Insert sample leagues
INSERT INTO leagues (name, country, logo_url, type) VALUES
('Premier League', 'England', 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png', 'league'),
('La Liga', 'Spain', 'https://logos-world.net/wp-content/uploads/2020/06/La-Liga-Logo.png', 'league'),
('Bundesliga', 'Germany', 'https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png', 'league'),
('Serie A', 'Italy', 'https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png', 'league'),
('Ligue 1', 'France', 'https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png', 'league')
ON CONFLICT (name) DO NOTHING;

-- Insert sample teams
INSERT INTO teams (name, short_name, league, country, founded, logo_url) VALUES
-- Premier League teams
('Manchester United', 'MUN', 'Premier League', 'England', 1878, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/985.png'),
('Liverpool', 'LIV', 'Premier League', 'England', 1892, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png'),
('Manchester City', 'MCI', 'Premier League', 'England', 1880, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52950.png'),
('Arsenal', 'ARS', 'Premier League', 'England', 1886, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52258.png'),
('Chelsea', 'CHE', 'Premier League', 'England', 1905, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52947.png'),
('Tottenham Hotspur', 'TOT', 'Premier League', 'England', 1882, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52948.png'),

-- La Liga teams
('Real Madrid', 'RMA', 'La Liga', 'Spain', 1902, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50051.png'),
('Barcelona', 'BAR', 'La Liga', 'Spain', 1899, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50065.png'),
('Atletico Madrid', 'ATM', 'La Liga', 'Spain', 1903, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50063.png'),
('Sevilla', 'SEV', 'La Liga', 'Spain', 1890, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50064.png'),

-- Bundesliga teams
('Bayern Munich', 'BAY', 'Bundesliga', 'Germany', 1900, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50037.png'),
('Borussia Dortmund', 'BVB', 'Bundesliga', 'Germany', 1909, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50038.png'),
('RB Leipzig', 'RBL', 'Bundesliga', 'Germany', 2009, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/260078.png'),
('Bayer Leverkusen', 'B04', 'Bundesliga', 'Germany', 1904, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50039.png'),

-- Serie A teams
('Juventus', 'JUV', 'Serie A', 'Italy', 1897, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50104.png'),
('AC Milan', 'MIL', 'Serie A', 'Italy', 1899, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50103.png'),
('Inter Milan', 'INT', 'Serie A', 'Italy', 1908, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50102.png'),
('Napoli', 'NAP', 'Serie A', 'Italy', 1926, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50105.png'),

-- Ligue 1 teams
('Paris Saint-Germain', 'PSG', 'Ligue 1', 'France', 1970, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png'),
('AS Monaco', 'MON', 'Ligue 1', 'Monaco', 1924, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52748.png'),
('Olympique Marseille', 'OM', 'Ligue 1', 'France', 1899, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52749.png'),
('Olympique Lyon', 'OL', 'Ligue 1', 'France', 1950, 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52750.png')
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Leagues and teams tables created successfully with sample data!' as status;
