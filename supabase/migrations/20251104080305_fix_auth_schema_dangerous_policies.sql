/*
  # Fix dangerous authentication policies

  ## Problem
  - The policy "users_select_anon" allows ANYONE to read ALL users (qual = true)
  - This causes "Database error querying schema" during login
  - This is also a major security issue

  ## Solution
  - Remove the dangerous anon SELECT policy
  - Keep only the authenticated SELECT policy
  - This will allow login to work properly

  ## Security
  - Anonymous users should NOT be able to read user data
  - Only authenticated users should see user information
*/

-- Drop the dangerous policy that allows anon to see all users
DROP POLICY IF EXISTS "users_select_anon" ON public.users;

-- Ensure authenticated users can still read users
-- (This policy already exists, just making sure)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'users_select_authenticated'
  ) THEN
    CREATE POLICY "users_select_authenticated"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
