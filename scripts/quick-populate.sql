-- BetHub Quick Sample Data Population
-- Run this in your Supabase SQL Editor to populate sample data

-- Insert sample matches (bypasses RLS when run as admin in Supabase)
INSERT INTO matches (id, league, home_team, away_team, kickoff_utc, status, is_published) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Premier League', 'Arsenal', 'Chelsea', '2024-12-20T15:00:00Z', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440002', 'Premier League', 'Liverpool', 'Manchester United', '2024-12-20T17:30:00Z', 'LIVE', true),
('550e8400-e29b-41d4-a716-446655440003', 'La Liga', 'Real Madrid', 'Barcelona', '2024-12-21T20:00:00Z', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440004', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', '2024-12-19T18:30:00Z', 'FT', true),
('550e8400-e29b-41d4-a716-446655440005', 'Serie A', 'Juventus', 'AC Milan', '2024-12-21T19:45:00Z', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440006', 'Premier League', 'Manchester City', 'Tottenham', '2024-12-22T16:00:00Z', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440007', 'La Liga', 'Atletico Madrid', 'Valencia', '2024-12-22T18:30:00Z', 'PRE', true),
('550e8400-e29b-41d4-a716-446655440008', 'Bundesliga', 'Borussia Dortmund', 'RB Leipzig', '2024-12-22T20:00:00Z', 'PRE', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample analysis snapshots
INSERT INTO analysis_snapshots (match_id, payload) VALUES
('550e8400-e29b-41d4-a716-446655440002', '{
  "matchId": "550e8400-e29b-41d4-a716-446655440002",
  "snapshotTs": "2024-12-20T17:30:00Z",
  "status": "LIVE",
  "aiInsights": [
    {
      "id": "insight_001",
      "content": "Liverpool showing strong attacking momentum with 65% possession in the last 15 minutes. Their high press is forcing Manchester United into defensive errors.",
      "confidence": 0.85
    },
    {
      "id": "insight_002",
      "content": "Manchester United counter-attacking strategy could be effective given Liverpool high defensive line. Watch for quick transitions through the wings.",
      "confidence": 0.72
    },
    {
      "id": "insight_003",
      "content": "Both teams showing high intensity. Liverpool leading on shots 7-4, but Manchester United clinical on their chances.",
      "confidence": 0.78
    }
  ],
  "stats": {
    "possession": {"Liverpool": 58, "Manchester United": 42},
    "shots": {"Liverpool": 7, "Manchester United": 4},
    "corners": {"Liverpool": 3, "Manchester United": 1},
    "yellowCards": {"Liverpool": 1, "Manchester United": 2}
  }
}'),
('550e8400-e29b-41d4-a716-446655440001', '{
  "matchId": "550e8400-e29b-41d4-a716-446655440001",
  "snapshotTs": "2024-12-20T14:45:00Z",
  "status": "PRE",
  "aiInsights": [
    {
      "id": "insight_004",
      "content": "Arsenal has won 3 of their last 5 encounters against Chelsea at Emirates. Their home form suggests strong advantage.",
      "confidence": 0.82
    },
    {
      "id": "insight_005",
      "content": "Chelsea recent away form has been inconsistent. Arsenal defensive solidity could be key factor.",
      "confidence": 0.74
    }
  ],
  "stats": {
    "head_to_head": {"Arsenal_wins": 3, "Chelsea_wins": 1, "draws": 1},
    "form": {"Arsenal": "WWLWW", "Chelsea": "WLWLD"}
  }
}'),
('550e8400-e29b-41d4-a716-446655440003', '{
  "matchId": "550e8400-e29b-41d4-a716-446655440003",
  "snapshotTs": "2024-12-21T19:45:00Z",
  "status": "PRE",
  "aiInsights": [
    {
      "id": "insight_006",
      "content": "El Clasico always delivers drama. Real Madrid slight edge with Bernabeu advantage, but Barcelona recent form impressive.",
      "confidence": 0.76
    },
    {
      "id": "insight_007",
      "content": "Both teams at full strength. Expect tactical battle between Ancelotti and Xavi systems.",
      "confidence": 0.88
    }
  ],
  "stats": {
    "historical": {"Real_Madrid_wins": 102, "Barcelona_wins": 97, "draws": 52},
    "current_season": {"Real_Madrid": "1st", "Barcelona": "2nd"}
  }
}');

-- Success message
SELECT 'Sample data populated successfully! 🎉' as message;
SELECT COUNT(*) as total_matches FROM matches;
SELECT COUNT(*) as total_analysis FROM analysis_snapshots; 