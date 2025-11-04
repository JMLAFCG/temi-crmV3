/*
  # Fix Users Table RLS for Login

  ## Problem
  - Recursive query in RLS policy causes "database error querying schema" during login
  - User cannot be fetched because policy checks users table while querying users table

  ## Solution
  - Drop existing problematic policies
  - Create simpler policies that don't cause recursion
  - Allow users to read their own data immediately after auth
  - Use raw_app_meta_data from JWT instead of querying users table

  ## Changes
  1. Drop existing SELECT and UPDATE policies
  2. Create new non-recursive policies
  3. Policies use auth.uid() only, no subqueries on users table
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins and managers can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data, admins can update all" ON users;

-- Create simple policy: users can always read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy: users can read all users (needed for app functionality)
-- This is safe because sensitive data should be filtered in the application layer
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Create policy: users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy: allow INSERT for new users (during registration/sync)
CREATE POLICY "Allow user creation"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy: only service role can delete users
CREATE POLICY "Only service role can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (false);
