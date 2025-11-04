/*
  # Remove ALL policies from auth schema tables
  
  The auth schema is managed internally by Supabase and should NOT have
  custom RLS policies. These policies interfere with Supabase Auth's 
  internal operations.
  
  1. Changes
    - Drop all custom policies from auth.users
    - This allows Supabase Auth to function normally
*/

-- Drop all custom policies from auth.users
DROP POLICY IF EXISTS "Allow anon to read auth.users for login" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated to read own auth.users" ON auth.users;
DROP POLICY IF EXISTS "Service role can access auth.users" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated users to read auth.users" ON auth.users;
DROP POLICY IF EXISTS "Allow service role full access to auth.users" ON auth.users;

-- Note: We do NOT disable RLS on auth.users as it's a system table
-- Supabase manages RLS on auth schema tables internally
