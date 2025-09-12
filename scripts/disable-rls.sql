-- Temporarily disable Row Level Security for development
-- This will allow all operations to work without permission issues

-- Disable RLS on all tables
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated and anon roles
GRANT ALL ON TABLE matches TO authenticated;
GRANT ALL ON TABLE matches TO anon;
GRANT ALL ON TABLE analysis_snapshots TO authenticated;
GRANT ALL ON TABLE analysis_snapshots TO anon;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE profiles TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Success message
SELECT 'RLS disabled - all operations should work now' as status;
