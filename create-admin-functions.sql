-- Create admin functions for match management
-- These functions bypass RLS for admin operations

-- Function to insert match as admin
CREATE OR REPLACE FUNCTION admin_insert_match(
  p_id uuid,
  p_league text,
  p_home_team text,
  p_away_team text,
  p_kickoff_utc timestamptz,
  p_status text DEFAULT 'PRE',
  p_is_published boolean DEFAULT false,
  p_analysis_status text DEFAULT 'none'
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin (this function has SECURITY DEFINER)
  IF NOT public.is_admin_user(auth.uid()) THEN
    RETURN json_build_object('error', 'Admin access required');
  END IF;
  
  -- Insert the match
  INSERT INTO matches (
    id, league, home_team, away_team, kickoff_utc, 
    status, is_published, analysis_status
  ) VALUES (
    p_id, p_league, p_home_team, p_away_team, p_kickoff_utc,
    p_status, p_is_published, p_analysis_status
  );
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'match_id', p_id,
    'message', 'Match inserted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Function to update match analysis status
CREATE OR REPLACE FUNCTION admin_update_analysis_status(
  p_match_id uuid,
  p_analysis_status text
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(auth.uid()) THEN
    RETURN json_build_object('error', 'Admin access required');
  END IF;
  
  -- Update the match
  UPDATE matches 
  SET analysis_status = p_analysis_status,
      updated_at = now()
  WHERE id = p_match_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'match_id', p_match_id,
    'analysis_status', p_analysis_status
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_insert_match TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_analysis_status TO authenticated; 