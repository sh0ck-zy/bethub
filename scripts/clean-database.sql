-- Clean Database Script
-- This script will drop all tables and data for a fresh start

-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS analysis_snapshots CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any sequences that might exist
DROP SEQUENCE IF EXISTS matches_id_seq CASCADE;
DROP SEQUENCE IF EXISTS analysis_snapshots_id_seq CASCADE;

-- Drop any custom types that might exist
DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS analysis_status CASCADE;

-- Clean up any remaining objects
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant permissions back to the schema
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable UUID extension for new setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean start message
SELECT 'Database cleaned successfully - ready for fresh setup' as status;