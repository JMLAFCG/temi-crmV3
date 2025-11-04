/*
  # Fix Performance and Security Issues

  ## Changes Made
  
  1. **Add Missing Foreign Key Indexes**
     - `commissions.project_id` - index for project lookups
     - `commissions.provider_id` - index for provider lookups
     - `documents.project_id` - index for document queries
     - `messages.conversation_id` - index for message retrieval
     - `prospection_activities.prospect_id` - index for activity queries
     - `prospection_activities.user_id` - index for user activity queries
     - `prospects.owner_id` - index for ownership queries
     - `staging_data.import_id` - index for import data queries
     - `staging_imports.uploaded_by` - index for uploader queries

  2. **Optimize RLS Policies**
     - Wrap all `auth.uid()` calls with `(select auth.uid())`
     - This prevents re-evaluation for each row, improving performance at scale
     - Affects tables: clients, users, email_templates, prospects, staging_imports

  3. **Remove Unused Indexes**
     - Drop `idx_email_templates_created_by` (not used)
     - Drop `idx_prospects_converted_to_client_id` (not used)
     - Drop `idx_users_company_id` (not used)

  ## Performance Impact
  - Foreign key queries will use indexes instead of sequential scans
  - RLS policies will evaluate auth functions once per query instead of per row
  - Unused indexes removed to reduce write overhead
*/

-- ============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

-- Commissions table indexes
CREATE INDEX IF NOT EXISTS idx_commissions_project_id ON public.commissions(project_id);
CREATE INDEX IF NOT EXISTS idx_commissions_provider_id ON public.commissions(provider_id);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Prospection activities indexes
CREATE INDEX IF NOT EXISTS idx_prospection_activities_prospect_id ON public.prospection_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospection_activities_user_id ON public.prospection_activities(user_id);

-- Prospects table indexes
CREATE INDEX IF NOT EXISTS idx_prospects_owner_id ON public.prospects(owner_id);

-- Staging data indexes
CREATE INDEX IF NOT EXISTS idx_staging_data_import_id ON public.staging_data(import_id);

-- Staging imports indexes
CREATE INDEX IF NOT EXISTS idx_staging_imports_uploaded_by ON public.staging_imports(uploaded_by);

-- ============================================
-- 2. OPTIMIZE RLS POLICIES - CLIENTS TABLE
-- ============================================

-- Drop and recreate clients policies with optimized auth calls
DROP POLICY IF EXISTS "Admins and managers can delete clients" ON public.clients;

CREATE POLICY "Admins and managers can delete clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 3. OPTIMIZE RLS POLICIES - USERS TABLE
-- ============================================

-- Drop and recreate users policies with optimized auth calls
DROP POLICY IF EXISTS "users_authenticated_select_own" ON public.users;
DROP POLICY IF EXISTS "users_authenticated_update_own" ON public.users;

CREATE POLICY "users_authenticated_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "users_authenticated_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================
-- 4. OPTIMIZE RLS POLICIES - EMAIL_TEMPLATES TABLE
-- ============================================

-- Drop and recreate email_templates policies with optimized auth calls
DROP POLICY IF EXISTS "Authenticated users can view and manage templates" ON public.email_templates;
DROP POLICY IF EXISTS "Managers can insert templates" ON public.email_templates;
DROP POLICY IF EXISTS "Managers can update templates" ON public.email_templates;
DROP POLICY IF EXISTS "Managers can delete templates" ON public.email_templates;

CREATE POLICY "Authenticated users can view and manage templates"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can insert templates"
  ON public.email_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update templates"
  ON public.email_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can delete templates"
  ON public.email_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 5. OPTIMIZE RLS POLICIES - PROSPECTS TABLE
-- ============================================

-- Drop and recreate prospects policies with optimized auth calls
DROP POLICY IF EXISTS "Users can view prospects based on role" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete their prospects" ON public.prospects;

CREATE POLICY "Users can view prospects based on role"
  ON public.prospects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can insert their own prospects"
  ON public.prospects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can update their prospects"
  ON public.prospects
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their prospects"
  ON public.prospects
  FOR DELETE
  TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 6. OPTIMIZE RLS POLICIES - STAGING_IMPORTS TABLE
-- ============================================

-- Drop and recreate staging_imports policies with optimized auth calls
DROP POLICY IF EXISTS "Users can view imports based on role" ON public.staging_imports;
DROP POLICY IF EXISTS "Users can insert their own imports" ON public.staging_imports;
DROP POLICY IF EXISTS "Users can update their imports" ON public.staging_imports;
DROP POLICY IF EXISTS "Users can delete their imports" ON public.staging_imports;

CREATE POLICY "Users can view imports based on role"
  ON public.staging_imports
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can insert their own imports"
  ON public.staging_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

CREATE POLICY "Users can update their imports"
  ON public.staging_imports
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their imports"
  ON public.staging_imports
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 7. REMOVE UNUSED INDEXES
-- ============================================

-- Drop unused indexes to reduce write overhead
DROP INDEX IF EXISTS public.idx_email_templates_created_by;
DROP INDEX IF EXISTS public.idx_prospects_converted_to_client_id;
DROP INDEX IF EXISTS public.idx_users_company_id;