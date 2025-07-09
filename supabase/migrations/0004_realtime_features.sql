-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_updates table for live match events
CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to matches table for live functionality
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_score INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_score INTEGER DEFAULT 0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_minute INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS live_stats JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_timestamp ON match_updates(timestamp);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_current_minute ON matches(current_minute);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff_utc ON matches(kickoff_utc);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_updates ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Match updates policies
CREATE POLICY "Users can view match updates" ON match_updates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage match updates" ON match_updates
  FOR ALL USING (auth.role() = 'service_role');

-- Add triggers to update updated_at (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_notifications_updated_at
          BEFORE UPDATE ON notifications
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_match_updates_updated_at
          BEFORE UPDATE ON match_updates
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create function to handle match status updates
CREATE OR REPLACE FUNCTION update_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on current time and match time
  IF NEW.kickoff_utc <= NOW() AND NEW.kickoff_utc + INTERVAL '2 hours' >= NOW() THEN
    NEW.status = 'LIVE';
  ELSIF NEW.kickoff_utc + INTERVAL '2 hours' < NOW() THEN
    NEW.status = 'FT';
  ELSE
    NEW.status = 'PRE';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
DROP TRIGGER IF EXISTS trigger_update_match_status ON matches;
CREATE TRIGGER trigger_update_match_status
  BEFORE INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_status();

-- Create function to create notification on match update
CREATE OR REPLACE FUNCTION create_match_update_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into match_updates table
  INSERT INTO match_updates (match_id, type, data)
  VALUES (NEW.id, 'score_update', jsonb_build_object(
    'home_team', NEW.home_team,
    'away_team', NEW.away_team,
    'home_score', COALESCE(NEW.home_score, 0),
    'away_score', COALESCE(NEW.away_score, 0),
    'minute', NEW.current_minute,
    'status', NEW.status
  ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match updates
DROP TRIGGER IF EXISTS trigger_match_update_notification ON matches;
CREATE TRIGGER trigger_match_update_notification
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (OLD.home_score IS DISTINCT FROM NEW.home_score OR OLD.away_score IS DISTINCT FROM NEW.away_score)
  EXECUTE FUNCTION create_match_update_notification();

-- Create function to get live matches
CREATE OR REPLACE FUNCTION get_live_matches()
RETURNS TABLE (
  id UUID,
  league TEXT,
  home_team TEXT,
  away_team TEXT,
  home_score INTEGER,
  away_score INTEGER,
  current_minute INTEGER,
  status TEXT,
  kickoff_utc TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.league,
    m.home_team,
    m.away_team,
    m.home_score,
    m.away_score,
    m.current_minute,
    m.status,
    m.kickoff_utc
  FROM matches m
  WHERE m.status = 'LIVE'
  ORDER BY m.kickoff_utc DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON notifications TO authenticated;
GRANT SELECT ON match_updates TO authenticated;
GRANT ALL ON notifications TO service_role;
GRANT ALL ON match_updates TO service_role; 