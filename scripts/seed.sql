-- Seed data for SPORTSBET INSIGHT development
-- Run this after setting up your Supabase database

-- Insert sample matches
INSERT INTO matches (id, league, home_team, away_team, kickoff_utc, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Premier League', 'Manchester United', 'Liverpool', '2025-06-17 15:00:00+00', 'PRE'),
('550e8400-e29b-41d4-a716-446655440002', 'Premier League', 'Arsenal', 'Chelsea', '2025-06-17 17:30:00+00', 'LIVE'),
('550e8400-e29b-41d4-a716-446655440003', 'La Liga', 'Real Madrid', 'Barcelona', '2025-06-17 20:00:00+00', 'PRE'),
('550e8400-e29b-41d4-a716-446655440004', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', '2025-06-17 18:30:00+00', 'FT'),
('550e8400-e29b-41d4-a716-446655440005', 'Serie A', 'Juventus', 'AC Milan', '2025-06-17 19:45:00+00', 'HT');

-- Insert sample analysis snapshots
INSERT INTO analysis_snapshots (match_id, snapshot_ts, payload) VALUES
('550e8400-e29b-41d4-a716-446655440002', NOW(), '{
  "matchId": "550e8400-e29b-41d4-a716-446655440002",
  "snapshotTs": "2025-06-17T14:30:00Z",
  "status": "LIVE",
  "aiInsights": [
    {
      "id": "insight_001",
      "content": "Arsenal is showing strong attacking momentum with 65% possession in the last 15 minutes. Their high press is forcing Chelsea into defensive errors.",
      "confidence": 0.85
    },
    {
      "id": "insight_002", 
      "content": "Chelsea''s counter-attacking strategy could be effective given Arsenal''s high defensive line. Watch for quick transitions through the wings.",
      "confidence": 0.72
    }
  ],
  "stats": {
    "possession": {"Arsenal": 58, "Chelsea": 42},
    "shots": {"Arsenal": 7, "Chelsea": 4},
    "corners": {"Arsenal": 3, "Chelsea": 1}
  }
}'),
('550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '5 minutes', '{
  "matchId": "550e8400-e29b-41d4-a716-446655440001",
  "snapshotTs": "2025-06-17T14:25:00Z",
  "status": "PRE",
  "aiInsights": [
    {
      "id": "insight_003",
      "content": "Manchester United has won 3 of their last 5 encounters against Liverpool at Old Trafford. Their home form suggests a competitive match ahead.",
      "confidence": 0.78
    }
  ],
  "stats": {
    "head_to_head": {"ManU_wins": 3, "Liverpool_wins": 1, "draws": 1}
  }
}');

