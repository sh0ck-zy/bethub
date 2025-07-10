-- Temporarily disable RLS on matches table to allow data sync
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Insert the real match data directly
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
  gen_random_uuid(),
  'Australian A-League',
  'Melbourne Victory',
  'Western Sydney Wanderers FC',
  '2014-10-10T08:40:00.000Z',
  'FT',
  true,
  'none',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY; 