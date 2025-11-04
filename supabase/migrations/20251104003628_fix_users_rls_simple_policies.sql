/*
  # Fix RLS on users table with simple, non-recursive policies

  ## Problem
  - Previous RLS policies may have caused recursion
  - Need simple, straightforward policies compatible with deployed code

  ## Solution
  1. Re-enable RLS on users table
  2. Drop all existing policies
  3. Create minimal, non-recursive policies:
     - Allow authenticated users to read all users (needed for app functionality)
     - Allow users to update their own data
     - Allow service role to manage users
     - Allow authenticated users to insert (for registration)

  ## Security
  - RLS is enabled
  - Policies are restrictive but functional
  - No recursive queries
*/

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Authenticated users can read users" ON users;
DROP POLICY IF EXISTS "Only service role can delete users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create simple, non-recursive policies
-- 1. SELECT: Authenticated users can read all users (needed for app functionality)
CREATE POLICY "users_select_authenticated"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. INSERT: Allow authenticated users to create their own record
CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Users can update their own data only
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. DELETE: Only service role (no user can delete)
CREATE POLICY "users_delete_none"
  ON users
  FOR DELETE
  TO authenticated
  USING (false);
