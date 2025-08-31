-- Clear existing matches to start fresh
DELETE FROM analysis_snapshots;
DELETE FROM matches;

SELECT 'All matches cleared - ready for real data' as status;