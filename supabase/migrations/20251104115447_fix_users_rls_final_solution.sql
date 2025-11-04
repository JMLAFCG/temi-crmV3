-- Fix RLS on users table to allow login
-- This ensures authenticated users can read their own user data during login

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read own data" ON users;
DROP POLICY IF EXISTS "Allow users to read own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;

-- Create a simple policy that allows users to read their own data
CREATE POLICY "authenticated_users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "authenticated_users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
