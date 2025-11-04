/*
  # Fix users table RLS for login flow

  ## Problem
  - During login, after Supabase Auth validates credentials, the app tries to read from users table
  - RLS policy blocks this read because the user is in a transitional auth state
  - This causes "Database error querying schema" during login

  ## Solution
  - Modify the SELECT policy to allow users to read their own record using auth.uid()
  - This allows the login flow to complete successfully

  ## Security
  - Users can ONLY read their own record (auth.uid() = id)
  - Admin users should be able to read all users
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;

-- Create a new policy that allows:
-- 1. Users to read their own record
-- 2. Admin users to read all records
CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
  );
