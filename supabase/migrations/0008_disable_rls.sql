-- Disable RLS on matches table for development
-- This allows the admin API to insert matches without RLS restrictions
ALTER TABLE matches DISABLE ROW LEVEL SECURITY; 