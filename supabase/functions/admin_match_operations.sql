-- Admin Match Operations - Bypass RLS for admin operations
-- These functions use SECURITY DEFINER to run with elevated privileges

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Function to insert match as admin (bypasses RLS)
CREATE OR REPLACE FUNCTION admin_insert_match(
  p_id uuid,
  p_league text,
  p_home_team text,
  p_away_team text,
  p_kickoff_utc timestamptz,
  p_status text DEFAULT 'PRE',
  p_is_published boolean DEFAULT false,
  p_analysis_status text DEFAULT 'none',
  p_venue text DEFAULT NULL,
  p_home_score integer DEFAULT NULL,
  p_away_score integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Insert the match
  INSERT INTO matches (
    id, league, home_team, away_team, kickoff_utc, 
    status, is_published, analysis_status, venue,
    home_score, away_score, created_at, updated_at
  ) VALUES (
    p_id, p_league, p_home_team, p_away_team, p_kickoff_utc,
    p_status, p_is_published, p_analysis_status, p_venue,
    p_home_score, p_away_score, now(), now()
  );
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'match_id', p_id,
    'message', 'Match inserted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to update match as admin (bypasses RLS)
CREATE OR REPLACE FUNCTION admin_update_match(
  p_id uuid,
  p_analysis_status text DEFAULT NULL,
  p_is_published boolean DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_home_score integer DEFAULT NULL,
  p_away_score integer DEFAULT NULL,
  p_venue text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Update the match
  UPDATE matches 
  SET 
    analysis_status = COALESCE(p_analysis_status, analysis_status),
    is_published = COALESCE(p_is_published, is_published),
    status = COALESCE(p_status, status),
    home_score = COALESCE(p_home_score, home_score),
    away_score = COALESCE(p_away_score, away_score),
    venue = COALESCE(p_venue, venue),
    updated_at = now()
  WHERE id = p_id;
  
  -- Check if any rows were affected
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Match not found'
    );
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'match_id', p_id,
    'message', 'Match updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to delete match as admin (bypasses RLS)
CREATE OR REPLACE FUNCTION admin_delete_match(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Delete the match
  DELETE FROM matches WHERE id = p_id;
  
  -- Check if any rows were affected
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Match not found'
    );
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'match_id', p_id,
    'message', 'Match deleted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION admin_insert_match TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_match TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_match TO authenticated; 