/*
  # Fix auth.users access for login
  
  The issue is that auth.users has RLS enabled but no policies.
  We cannot disable RLS on system tables, so we add policies instead.
  
  1. Security Changes
    - Drop existing policies if any (to avoid conflicts)
    - Add policy for service_role to access auth.users
    - This allows Supabase Auth to function correctly
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read auth.users" ON auth.users;
DROP POLICY IF EXISTS "Allow service role full access to auth.users" ON auth.users;
DROP POLICY IF EXISTS "Service role can access auth.users" ON auth.users;

-- Create policy to allow service role full access (needed for auth to work)
CREATE POLICY "Service role can access auth.users"
  ON auth.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
