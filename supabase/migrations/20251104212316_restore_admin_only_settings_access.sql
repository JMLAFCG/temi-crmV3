/*
  # Restore admin-only access to app_settings
  
  1. Changes
    - Drop permissive update policy
    - Recreate restrictive policy for admins only
    - Keep read access for all authenticated users
  
  2. Security
    - Only admin users can update settings
    - All authenticated users can read settings
*/

-- Drop the permissive policy
DROP POLICY IF EXISTS "Authenticated users can update settings" ON app_settings;

-- Recreate admin-only update policy
CREATE POLICY "Only admins can update settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
