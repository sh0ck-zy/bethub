-- Nuclear option: Give postgres role ownership of everything

-- Change ownership of tables to postgres
ALTER TABLE matches OWNER TO postgres;
ALTER TABLE analysis_snapshots OWNER TO postgres;
ALTER TABLE profiles OWNER TO postgres;

-- Completely disable RLS
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_snapshots DISABLE ROW LEVEL SECURITY;  
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "Public matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Service role can do everything on matches" ON matches;
DROP POLICY IF EXISTS "Service role full access" ON matches;
DROP POLICY IF EXISTS "Public can read published matches" ON matches;
DROP POLICY IF EXISTS "Service role full access analysis" ON analysis_snapshots;
DROP POLICY IF EXISTS "Public can read analysis for published matches" ON analysis_snapshots;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;

-- Grant EVERYTHING to EVERYONE (development only!)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

SELECT 'Nuclear permissions applied - EVERYTHING should work now' as status;