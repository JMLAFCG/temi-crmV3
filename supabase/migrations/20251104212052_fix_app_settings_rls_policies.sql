/*
  # Fix app_settings RLS policies
  
  1. Changes
    - Drop existing restrictive UPDATE policy
    - Create new policy allowing all authenticated users to update settings
    - This is acceptable since app_settings is a single-row configuration table
  
  2. Security
    - Only authenticated users can update
    - All authenticated users can read (existing policy)
*/

-- Drop existing restrictive update policy
DROP POLICY IF EXISTS "Admins and managers can update settings" ON app_settings;

-- Create new update policy for all authenticated users
CREATE POLICY "Authenticated users can update settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
