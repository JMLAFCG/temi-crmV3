/*
  # Fix RLS on users table - Allow all authenticated users

  ## Changes
  - Re-enable RLS on users table
  - Drop all existing restrictive policies
  - Create permissive policies that allow authenticated users to access their data
  
  ## Security
  - Users can only see and modify their own data
  - Service role bypasses RLS for admin operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_none" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Allow users to read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Allow users to update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Allow service role full access"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
