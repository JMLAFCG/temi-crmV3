/*
  # Security and Performance Fixes - V2
  
  Fixed approach: Drop policies first, then recreate functions, then recreate policies
*/

-- ========================================
-- STEP 1: Drop ALL Existing Policies
-- ========================================

-- users
DROP POLICY IF EXISTS "Admin full access to users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Users view their profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users update their profile" ON users;

-- clients
DROP POLICY IF EXISTS "Admin full access to clients" ON clients;
DROP POLICY IF EXISTS "Apporteurs and agents manage clients" ON clients;
DROP POLICY IF EXISTS "Clients view their data" ON clients;

-- projects
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Agents can manage their projects" ON projects;
DROP POLICY IF EXISTS "Users manage their projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;
DROP POLICY IF EXISTS "Apporteurs and agents can create projects" ON projects;
DROP POLICY IF EXISTS "Clients view their projects" ON projects;
DROP POLICY IF EXISTS "Companies can view their projects" ON projects;

-- companies
DROP POLICY IF EXISTS "Admin full access to companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "All users view companies" ON companies;
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies" ON companies;

-- business_providers
DROP POLICY IF EXISTS "Admin full access to providers" ON business_providers;
DROP POLICY IF EXISTS "Users manage their providers" ON business_providers;
DROP POLICY IF EXISTS "Users can create providers" ON business_providers;
DROP POLICY IF EXISTS "All users view providers" ON business_providers;
DROP POLICY IF EXISTS "Users can update providers" ON business_providers;

-- documents
DROP POLICY IF EXISTS "Admin full access to documents" ON documents;
DROP POLICY IF EXISTS "Users can create documents" ON documents;
DROP POLICY IF EXISTS "Users can view documents" ON documents;
DROP POLICY IF EXISTS "Users can update documents" ON documents;

-- messages
DROP POLICY IF EXISTS "Admin full access to messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON messages;

-- notifications
DROP POLICY IF EXISTS "Admin full access to notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

-- commissions
DROP POLICY IF EXISTS "Admin full access to commissions" ON commissions;
DROP POLICY IF EXISTS "Users can create commissions" ON commissions;
DROP POLICY IF EXISTS "Users can view commissions for their projects" ON commissions;
DROP POLICY IF EXISTS "Users can update commissions" ON commissions;

-- audit_logs
DROP POLICY IF EXISTS "Admin full access to audit_logs" ON audit_logs;

-- app_settings
DROP POLICY IF EXISTS "Admin full access to app_settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can view settings" ON app_settings;
DROP POLICY IF EXISTS "Users can view app_settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON app_settings;

-- registration_requests
DROP POLICY IF EXISTS "Admin full access to registration_requests" ON registration_requests;
DROP POLICY IF EXISTS "Anyone can create registration request" ON registration_requests;
DROP POLICY IF EXISTS "Admins and managers can view all registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins and managers can update registration requests" ON registration_requests;

-- ========================================
-- STEP 2: Recreate Helper Functions with Optimizations
-- ========================================

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM users WHERE auth_user_id = (SELECT auth.uid()) LIMIT 1;
$$;

-- ========================================
-- STEP 3: Create Optimized Policies (One per Action)
-- ========================================

-- USERS
CREATE POLICY "users_select_policy" ON users FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR 
  id = (SELECT get_current_user_id())
);

CREATE POLICY "users_insert_policy" ON users FOR INSERT TO authenticated
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "users_update_policy" ON users FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR 
  id = (SELECT get_current_user_id())
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR 
  id = (SELECT get_current_user_id())
);

CREATE POLICY "users_delete_policy" ON users FOR DELETE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

-- CLIENTS
CREATE POLICY "clients_select_policy" ON clients FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
);

CREATE POLICY "clients_insert_policy" ON clients FOR INSERT TO authenticated
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
);

CREATE POLICY "clients_update_policy" ON clients FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
);

CREATE POLICY "clients_delete_policy" ON clients FOR DELETE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
);

-- PROJECTS
CREATE POLICY "projects_select_policy" ON projects FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  agent_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire') OR
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = projects.client_id 
    AND clients.user_id = (SELECT get_current_user_id())
  )
);

CREATE POLICY "projects_insert_policy" ON projects FOR INSERT TO authenticated
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  agent_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
);

CREATE POLICY "projects_update_policy" ON projects FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  agent_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  agent_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
);

CREATE POLICY "projects_delete_policy" ON projects FOR DELETE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  agent_id = (SELECT get_current_user_id())
);

-- COMPANIES
CREATE POLICY "companies_select_policy" ON companies FOR SELECT TO authenticated
USING (true);

CREATE POLICY "companies_insert_policy" ON companies FOR INSERT TO authenticated
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "companies_update_policy" ON companies FOR UPDATE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin')
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "companies_delete_policy" ON companies FOR DELETE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

-- BUSINESS_PROVIDERS
CREATE POLICY "business_providers_select_policy" ON business_providers FOR SELECT TO authenticated
USING (true);

CREATE POLICY "business_providers_insert_policy" ON business_providers FOR INSERT TO authenticated
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id()) OR
  (SELECT get_current_user_role()) IN ('apporteur', 'agent', 'mandataire')
);

CREATE POLICY "business_providers_update_policy" ON business_providers FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
);

CREATE POLICY "business_providers_delete_policy" ON business_providers FOR DELETE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
);

-- DOCUMENTS
CREATE POLICY "documents_select_policy" ON documents FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  uploaded_by = (SELECT get_current_user_id())
);

CREATE POLICY "documents_insert_policy" ON documents FOR INSERT TO authenticated
WITH CHECK (uploaded_by = (SELECT get_current_user_id()));

CREATE POLICY "documents_update_policy" ON documents FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  uploaded_by = (SELECT get_current_user_id())
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  uploaded_by = (SELECT get_current_user_id())
);

CREATE POLICY "documents_delete_policy" ON documents FOR DELETE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  uploaded_by = (SELECT get_current_user_id())
);

-- MESSAGES
CREATE POLICY "messages_select_policy" ON messages FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  sender_id = (SELECT get_current_user_id()) OR
  recipient_id = (SELECT get_current_user_id())
);

CREATE POLICY "messages_insert_policy" ON messages FOR INSERT TO authenticated
WITH CHECK (sender_id = (SELECT get_current_user_id()));

CREATE POLICY "messages_update_policy" ON messages FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  sender_id = (SELECT get_current_user_id())
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  sender_id = (SELECT get_current_user_id())
);

CREATE POLICY "messages_delete_policy" ON messages FOR DELETE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

-- NOTIFICATIONS
CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
);

CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT TO authenticated
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
)
WITH CHECK (
  (SELECT get_current_user_role()) = 'admin' OR
  user_id = (SELECT get_current_user_id())
);

CREATE POLICY "notifications_delete_policy" ON notifications FOR DELETE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

-- COMMISSIONS
CREATE POLICY "commissions_select_policy" ON commissions FOR SELECT TO authenticated
USING (
  (SELECT get_current_user_role()) = 'admin' OR
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = commissions.project_id 
    AND projects.agent_id = (SELECT get_current_user_id())
  )
);

CREATE POLICY "commissions_insert_policy" ON commissions FOR INSERT TO authenticated
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "commissions_update_policy" ON commissions FOR UPDATE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin')
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "commissions_delete_policy" ON commissions FOR DELETE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

-- AUDIT_LOGS
CREATE POLICY "audit_logs_select_policy" ON audit_logs FOR SELECT TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "audit_logs_insert_policy" ON audit_logs FOR INSERT TO authenticated
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

-- APP_SETTINGS
CREATE POLICY "app_settings_select_policy" ON app_settings FOR SELECT TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

CREATE POLICY "app_settings_update_policy" ON app_settings FOR UPDATE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin')
WITH CHECK ((SELECT get_current_user_role()) = 'admin');

-- REGISTRATION_REQUESTS
CREATE POLICY "registration_requests_select_policy" ON registration_requests FOR SELECT TO authenticated
USING ((SELECT get_current_user_role()) IN ('admin', 'manager'));

CREATE POLICY "registration_requests_insert_policy" ON registration_requests FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "registration_requests_update_policy" ON registration_requests FOR UPDATE TO authenticated
USING ((SELECT get_current_user_role()) IN ('admin', 'manager'))
WITH CHECK ((SELECT get_current_user_role()) IN ('admin', 'manager'));

CREATE POLICY "registration_requests_delete_policy" ON registration_requests FOR DELETE TO authenticated
USING ((SELECT get_current_user_role()) = 'admin');

-- ========================================
-- STEP 4: Drop Unused Indexes
-- ========================================

DROP INDEX IF EXISTS users_role_idx;
DROP INDEX IF EXISTS clients_created_at_idx;
DROP INDEX IF EXISTS companies_created_at_idx;
DROP INDEX IF EXISTS projects_status_idx;
DROP INDEX IF EXISTS projects_created_at_idx;
DROP INDEX IF EXISTS documents_project_id_idx;
DROP INDEX IF EXISTS quotes_project_id_idx;
DROP INDEX IF EXISTS invoices_project_id_idx;
DROP INDEX IF EXISTS tasks_project_id_idx;
DROP INDEX IF EXISTS tasks_assigned_to_idx;
DROP INDEX IF EXISTS messages_sender_id_idx;
DROP INDEX IF EXISTS messages_recipient_id_idx;
DROP INDEX IF EXISTS notifications_user_id_idx;
DROP INDEX IF EXISTS commissions_project_id_idx;
DROP INDEX IF EXISTS audit_logs_created_at_idx;
DROP INDEX IF EXISTS idx_registration_requests_created_at;
DROP INDEX IF EXISTS idx_documents_uploaded_by;
DROP INDEX IF EXISTS idx_invoices_quote_id;
DROP INDEX IF EXISTS idx_messages_project_id;
DROP INDEX IF EXISTS idx_registration_requests_created_user_id;
DROP INDEX IF EXISTS idx_registration_requests_reviewed_by;
DROP INDEX IF EXISTS idx_user_roles_organization_id;
DROP INDEX IF EXISTS idx_user_roles_role_id;
