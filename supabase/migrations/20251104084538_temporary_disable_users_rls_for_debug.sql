/*
  # Temporary: Disable RLS on users table for debugging

  ## Purpose
  - Temporarily disable RLS on users table to test if it's causing the auth error
  - This is ONLY for debugging - we will re-enable it with proper policies after

  ## Security Note
  - ⚠️ This is TEMPORARY and for debugging only
  - DO NOT deploy to production with RLS disabled
*/

-- Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
