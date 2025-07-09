-- BetHub Database Setup Script
-- Run this in your Supabase SQL Editor

-- Initial schema (matches and analysis_snapshots tables)
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY,
  league text,
  home_team text,
  away_team text,
  kickoff_utc timestamptz,
  status text -- PRE/LIVE/FT
);

CREATE TABLE IF NOT EXISTS analysis_snapshots (
  id bigserial PRIMARY KEY,
  match_id uuid REFERENCES matches(id),
  snapshot_ts timestamptz DEFAULT now(),
  payload jsonb NOT NULL
);

-- Add profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add admin fields to matches table (check if columns exist first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'is_published') THEN
        ALTER TABLE matches 
        ADD COLUMN is_published boolean DEFAULT false,
        ADD COLUMN analysis_status text DEFAULT 'none' CHECK (analysis_status IN ('none', 'pending', 'completed', 'failed')),
        ADD COLUMN created_by uuid REFERENCES profiles(id),
        ADD COLUMN created_at timestamptz DEFAULT now(),
        ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_matches_published ON matches(is_published);
CREATE INDEX IF NOT EXISTS idx_matches_analysis_status ON matches(analysis_status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for matches
DROP POLICY IF EXISTS "Anyone can view published matches" ON matches;
CREATE POLICY "Anyone can view published matches" ON matches
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can view all matches" ON matches;
CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert matches" ON matches;
CREATE POLICY "Admins can insert matches" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update matches" ON matches;
CREATE POLICY "Admins can update matches" ON matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO matches (id, league, home_team, away_team, kickoff_utc, status, is_published) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Premier League', 'Arsenal', 'Chelsea', '2024-12-20 15:00:00+00', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440002', 'Premier League', 'Liverpool', 'Manchester United', '2024-12-20 17:30:00+00', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440003', 'La Liga', 'Real Madrid', 'Barcelona', '2024-12-21 20:00:00+00', 'PRE', true)
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: matches, analysis_snapshots, profiles';
    RAISE NOTICE 'Row Level Security enabled';
    RAISE NOTICE 'Sample matches inserted';
END $$; 