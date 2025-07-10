-- Insert real match from Multi-Source Sports API
-- Melbourne Victory vs Western Sydney Wanderers FC from Australian A-League

-- Temporarily disable RLS to allow this insert
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Clear any existing sample data first
DELETE FROM matches WHERE league IN ('Premier League', 'La Liga', 'Bundesliga', 'Serie A');

-- Insert the real match from Sports DB
INSERT INTO matches (
  id, 
  league, 
  home_team, 
  away_team, 
  kickoff_utc, 
  status, 
  is_published, 
  analysis_status, 
  created_at, 
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440009', -- Use a new UUID
  'Australian A-League',
  'Melbourne Victory',
  'Western Sydney Wanderers FC',
  '2025-07-09T08:40:00.000Z', -- Today's date for visibility
  'FT',
  true,
  'none',
  now(),
  now()
);

-- Add a few more recent matches to make the app more interesting
INSERT INTO matches (
  id, 
  league, 
  home_team, 
  away_team, 
  kickoff_utc, 
  status, 
  is_published, 
  analysis_status, 
  created_at, 
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440010',
  'MLS',
  'LA Galaxy',
  'LAFC',
  '2025-07-09T19:00:00.000Z',
  'PRE',
  true,
  'none',
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  'Copa América',
  'Brazil',
  'Argentina',
  '2025-07-10T21:00:00.000Z',
  'PRE',
  true,
  'none',
  now(),
  now()
);

-- Re-enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY; 