/*
  # Fix app_settings RLS policies - Complete Access
  
  1. Changes
    - Add INSERT policy for admins
    - Ensure SELECT policy is truly permissive
    - Add DELETE policy for admins (for maintenance)
  
  2. Security
    - Admins can do everything (SELECT, INSERT, UPDATE, DELETE)
    - All authenticated users can SELECT
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON app_settings;

-- SELECT: All authenticated users can view settings
CREATE POLICY "Authenticated users can view settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- UPDATE: Admins can update settings
CREATE POLICY "Admins can update settings"
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

-- DELETE: Admins can delete settings (for maintenance)
CREATE POLICY "Admins can delete settings"
  ON app_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
