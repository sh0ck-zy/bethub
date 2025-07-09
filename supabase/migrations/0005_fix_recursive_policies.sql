-- Fix infinite recursion in RLS policies
-- This migration fixes the circular dependency issue

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all matches" ON matches;
DROP POLICY IF EXISTS "Admins can insert matches" ON matches;
DROP POLICY IF EXISTS "Admins can update matches" ON matches;

-- Create a function that safely checks admin role (avoiding recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
BEGIN
  -- Use a direct query without RLS to avoid recursion
  -- This function has SECURITY DEFINER so it bypasses RLS
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant usage on the function
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;

-- Recreate policies using the safe function
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert matches" ON matches
  FOR INSERT WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update matches" ON matches
  FOR UPDATE USING (public.is_admin_user(auth.uid()));

-- Add missing policy for admins to update profiles  
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin_user(auth.uid()));

-- Add missing policy for admins to insert profiles
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (public.is_admin_user(auth.uid()));

-- Success notification
DO $$
BEGIN
    RAISE NOTICE 'Fixed infinite recursion in RLS policies!';
    RAISE NOTICE 'Admin functions created successfully';
END $$; 