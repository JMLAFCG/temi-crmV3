/*
  # Optimisation des RLS Policies - Performance

  ## Problème
  Les policies RLS utilisent `auth.uid()` directement, ce qui cause une réévaluation
  pour chaque ligne. Cela dégrade les performances à grande échelle.

  ## Solution
  Remplacer `auth.uid()` par `(select auth.uid())` dans toutes les policies.
  Cette optimisation force PostgreSQL à évaluer la fonction une seule fois.

  ## Tables concernées
  - conversations (3 policies)
  - messages (3 policies)
  - appointments (4 policies)
  - users (2 policies)
  - clients (4 policies)
  - projects (4 policies)
  - companies (1 policy)
  - business_providers (2 policies)
  - documents (2 policies)
  - commissions (2 policies)
  - audit_logs (1 policy)

  ## Sécurité
  - Aucun changement de logique de sécurité
  - Performance améliorée sans compromettre la sécurité
*/

-- ============================================================================
-- CONVERSATIONS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = ANY(participants) OR (select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;
CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = ANY(participants) OR (select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = ANY(participants) OR (select auth.uid()) = created_by);

-- ============================================================================
-- MESSAGES - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND ((select auth.uid()) = ANY(conversations.participants) OR (select auth.uid()) = conversations.created_by)
    )
  );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND ((select auth.uid()) = ANY(conversations.participants) OR (select auth.uid()) = conversations.created_by)
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = sender_id)
  WITH CHECK ((select auth.uid()) = sender_id);

-- ============================================================================
-- APPOINTMENTS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = ANY(participants) OR (select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;
CREATE POLICY "Users can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete their appointments" ON appointments;
CREATE POLICY "Users can delete their appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by);

-- ============================================================================
-- USERS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own data and agents" ON users;
CREATE POLICY "Users can view their own data and agents"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- CLIENTS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view clients" ON clients;
CREATE POLICY "Users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create clients" ON clients;
CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update clients" ON clients;
CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete clients" ON clients;
CREATE POLICY "Users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- PROJECTS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = client_id OR (select auth.uid()) = agent_id);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = client_id OR (select auth.uid()) = agent_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = client_id OR (select auth.uid()) = agent_id)
  WITH CHECK ((select auth.uid()) = client_id OR (select auth.uid()) = agent_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = client_id OR (select auth.uid()) = agent_id);

-- ============================================================================
-- COMPANIES - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- BUSINESS_PROVIDERS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view business providers" ON business_providers;
CREATE POLICY "Users can view business providers"
  ON business_providers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can manage business providers" ON business_providers;
CREATE POLICY "Admins can manage business providers"
  ON business_providers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- DOCUMENTS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view documents of their projects" ON documents;
CREATE POLICY "Users can view documents of their projects"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND ((select auth.uid()) = projects.client_id OR (select auth.uid()) = projects.agent_id)
    )
  );

DROP POLICY IF EXISTS "Users can upload documents to their projects" ON documents;
CREATE POLICY "Users can upload documents to their projects"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = uploaded_by
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND ((select auth.uid()) = projects.client_id OR (select auth.uid()) = projects.agent_id)
    )
  );

-- ============================================================================
-- COMMISSIONS - Optimisation RLS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their commissions" ON commissions;
CREATE POLICY "Users can view their commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_providers
      WHERE business_providers.id = commissions.provider_id
      AND business_providers.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage commissions" ON commissions;
CREATE POLICY "Admins can manage commissions"
  ON commissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- AUDIT_LOGS - Optimisation RLS
-- ============================================================================

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