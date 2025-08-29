-- Fix policy conflicts by dropping and recreating policies with proper handling

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can manage notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view match updates" ON match_updates;
DROP POLICY IF EXISTS "Service role can manage match updates" ON match_updates;

-- Recreate policies with proper handling
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view match updates" ON match_updates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage match updates" ON match_updates
  FOR ALL USING (auth.role() = 'service_role'); 