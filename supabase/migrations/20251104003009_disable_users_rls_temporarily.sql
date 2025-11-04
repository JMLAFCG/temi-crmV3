/*
  # Temporarily disable RLS on users table for debugging

  ## Problem
  - Persistent "Database error querying schema" during login
  - Need to isolate if RLS is causing the issue

  ## Solution
  - Temporarily disable RLS on users table
  - This will help identify if RLS policies are the root cause

  ## WARNING
  - This is TEMPORARY and INSECURE
  - Re-enable RLS after identifying the issue
*/

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
