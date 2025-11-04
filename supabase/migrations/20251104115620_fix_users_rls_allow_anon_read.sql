-- Fix users table RLS to allow reading during login process
-- The issue is that the app tries to read users table before authentication completes

-- Drop all existing policies
DROP POLICY IF EXISTS "authenticated_users_select_own" ON users;
DROP POLICY IF EXISTS "authenticated_users_update_own" ON users;
DROP POLICY IF EXISTS "Allow users to read own data" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;

-- Allow authenticated users to read their own data
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow anon users to read users table during login
-- This is necessary because the app queries the users table before auth completes
CREATE POLICY "users_select_during_login"
  ON users
  FOR SELECT
  TO anon
  USING (true);
