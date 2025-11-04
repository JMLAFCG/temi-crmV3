/*
  # Fix users table RLS - Remove recursive query

  ## Problem
  - The current SELECT policy has a recursive subquery that checks users table
  - This causes "Database error querying schema" during login
  - RLS policies cannot recursively query the same table they protect

  ## Solution
  - Simplify the policy to ONLY allow users to read their own record
  - Use auth.uid() = id which is direct and non-recursive
  - Admin access will be handled differently (through service role or separate mechanism)

  ## Security
  - Each user can ONLY read their own record
  - Simple, efficient, and no circular dependencies
*/

-- Drop the problematic policy with recursive query
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;

-- Create a simple, non-recursive policy
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
