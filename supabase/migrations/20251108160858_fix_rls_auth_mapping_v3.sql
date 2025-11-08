/*
  # Fix RLS Authentication Mapping - Final Version
  
  1. Problem
    - auth.uid() returns auth.users.id but public.users has separate IDs
    - auth_user_id links them but can be NULL for some users
    - RLS policies fail when they can't match users
    
  2. Solution
    - Create helper functions for current user ID and role
    - Rebuild all RLS policies with correct column names
    - Preserve all existing data
    
  3. Tables Updated
    - clients (user_id column)
    - projects (agent_id column)
    - companies
    - business_providers (user_id column)
    - users
*/

-- Helper function: get current user's public.users.id from their auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ===== DROP ALL EXISTING POLICIES =====
DROP POLICY IF EXISTS "Admin full access to clients" ON clients;
DROP POLICY IF EXISTS "Apporteurs and agents can manage their clients" ON clients;
DROP POLICY IF EXISTS "Clients can view their own data" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
DROP POLICY IF EXISTS "Apporteurs and agents can manage clients" ON clients;
DROP POLICY IF EXISTS "Clients can view their data" ON clients;

DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Users can manage their projects" ON projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON projects;

DROP POLICY IF EXISTS "Admin full access to companies" ON companies;
DROP POLICY IF EXISTS "Entreprise users can manage their company" ON companies;
DROP POLICY IF EXISTS "Users can view companies" ON companies;

DROP POLICY IF EXISTS "Admin full access to business_providers" ON business_providers;
DROP POLICY IF EXISTS "Admin full access to providers" ON business_providers;
DROP POLICY IF EXISTS "Users can manage their providers" ON business_providers;
DROP POLICY IF EXISTS "Users can view providers" ON business_providers;

DROP POLICY IF EXISTS "Admin full access to users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their profile" ON users;

-- ===== CLIENTS TABLE POLICIES =====
CREATE POLICY "Admin full access to clients"
  ON clients FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Apporteurs and agents manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (
    user_id = get_current_user_id() OR
    get_current_user_role() IN ('apporteur', 'agent', 'mandataire')
  )
  WITH CHECK (
    user_id = get_current_user_id() OR
    get_current_user_role() IN ('apporteur', 'agent', 'mandataire')
  );

CREATE POLICY "Clients view their data"
  ON clients FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

-- ===== PROJECTS TABLE POLICIES =====
CREATE POLICY "Admin full access to projects"
  ON projects FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Users manage their projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    agent_id = get_current_user_id() OR
    get_current_user_role() IN ('apporteur', 'agent', 'mandataire')
  )
  WITH CHECK (
    agent_id = get_current_user_id() OR
    get_current_user_role() IN ('apporteur', 'agent', 'mandataire')
  );

CREATE POLICY "Clients view their projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = projects.client_id
      AND clients.user_id = get_current_user_id()
    )
  );

-- ===== COMPANIES TABLE POLICIES =====
CREATE POLICY "Admin full access to companies"
  ON companies FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "All users view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- ===== BUSINESS_PROVIDERS TABLE POLICIES =====
CREATE POLICY "Admin full access to providers"
  ON business_providers FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Users manage their providers"
  ON business_providers FOR ALL
  TO authenticated
  USING (
    user_id = get_current_user_id() OR
    get_current_user_role() IN ('apporteur', 'agent', 'mandataire')
  )
  WITH CHECK (
    user_id = get_current_user_id() OR
    get_current_user_role() IN ('apporteur', 'agent', 'mandataire')
  );

CREATE POLICY "All users view providers"
  ON business_providers FOR SELECT
  TO authenticated
  USING (true);

-- ===== USERS TABLE POLICIES =====
CREATE POLICY "Admin full access to users"
  ON users FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Users view their profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = get_current_user_id());

CREATE POLICY "Users update their profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = get_current_user_id())
  WITH CHECK (id = get_current_user_id());
