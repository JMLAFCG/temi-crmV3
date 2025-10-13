/*
  # Enable RLS on audit_logs table

  1. Security
    - Enable RLS on audit_logs table
    - Add policy for admins to read all logs
    - Add policy for users to read their own actions
    - Add policy for system to insert logs

  2. Performance
    - Add index on changed_at for time-based queries
    - Add index on changed_by for user-based queries
    - Add index on table_name for table-based queries
*/

-- Enable RLS
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Admins can read all logs
CREATE POLICY "Admins can read all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can read logs of their own actions
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (changed_by = auth.uid());

-- System can insert logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);