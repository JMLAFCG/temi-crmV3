/*
  # Optimize RLS Policies for Performance

  1. RLS Performance Optimization
    - Replace auth.uid() with (select auth.uid()) in RLS policies
    - This prevents re-evaluation for each row, improving query performance at scale
    
  2. Tables Being Optimized
    - registration_requests (2 policies)
    - companies (2 policies)
    - users (2 policies)
    - clients (4 policies)
    - business_providers (3 policies)
    - projects (3 policies)
    - user_roles (1 policy)
    - messages (1 policy)
    - notifications (1 policy)
    - audit_logs (1 policy)
    - app_settings (2 policies)
    
  3. Security
    - No changes to security logic
    - Same access controls, just optimized execution
*/

-- Drop and recreate registration_requests policies with optimization
DROP POLICY IF EXISTS "Admins and managers can view all registration requests" ON registration_requests;
CREATE POLICY "Admins and managers can view all registration requests"
  ON registration_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Admins and managers can update registration requests" ON registration_requests;
CREATE POLICY "Admins and managers can update registration requests"
  ON registration_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Drop and recreate companies policies with optimization
DROP POLICY IF EXISTS "Users can create companies" ON companies;
CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can update companies" ON companies;
CREATE POLICY "Users can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate users policies with optimization
DROP POLICY IF EXISTS "Admins can insert users" ON users;
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Drop and recreate clients policies with optimization
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create clients" ON clients;
CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can update clients" ON clients;
CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can view clients" ON clients;
CREATE POLICY "Users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop and recreate business_providers policies with optimization
DROP POLICY IF EXISTS "Users can create providers" ON business_providers;
CREATE POLICY "Users can create providers"
  ON business_providers FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can update providers" ON business_providers;
CREATE POLICY "Users can update providers"
  ON business_providers FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can view providers" ON business_providers;
CREATE POLICY "Users can view providers"
  ON business_providers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop and recreate projects policies with optimization
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete projects" ON projects;
CREATE POLICY "Users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Users can update projects" ON projects;
CREATE POLICY "Users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Drop and recreate user_roles policy with optimization
DROP POLICY IF EXISTS "Users can view their roles" ON user_roles;
CREATE POLICY "Users can view their roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate messages policy with optimization
DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = (select auth.uid()) OR 
    recipient_id = (select auth.uid())
  );

-- Drop and recreate notifications policy with optimization
DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
CREATE POLICY "Users can view notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate audit_logs policy with optimization
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

-- Drop and recreate app_settings policies with optimization
DROP POLICY IF EXISTS "Admins can update settings" ON app_settings;
CREATE POLICY "Admins can update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view settings" ON app_settings;
CREATE POLICY "Admins can view settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );