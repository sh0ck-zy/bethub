-- Fix Database Permissions
-- This script fixes the RLS policies to allow API operations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin operations on matches" ON matches;
DROP POLICY IF EXISTS "Admin updates on matches" ON matches;
DROP POLICY IF EXISTS "Admin deletes on matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can view all matches" ON matches;
DROP POLICY IF EXISTS "Admin operations on analysis" ON analysis_snapshots;
DROP POLICY IF EXISTS "Admin updates on analysis" ON analysis_snapshots;
DROP POLICY IF EXISTS "Admin deletes on analysis" ON analysis_snapshots;

-- Temporarily disable RLS for easier development
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable with simpler policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (your API calls)
CREATE POLICY "Service role full access" ON matches
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access analysis" ON analysis_snapshots
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Allow public read access to published matches only
CREATE POLICY "Public can read published matches" ON matches
    FOR SELECT USING (is_published = true OR auth.role() = 'service_role');

CREATE POLICY "Public can read analysis for published matches" ON analysis_snapshots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = analysis_snapshots.match_id 
            AND (matches.is_published = true OR auth.role() = 'service_role')
        )
    );

-- Success message
SELECT 'Permissions fixed - API should now work' as status;