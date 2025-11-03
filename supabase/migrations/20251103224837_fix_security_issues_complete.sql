/*
  # Fix Security and Performance Issues - Complete
  
  1. Add Missing Foreign Key Indexes
    - Add index on `email_templates.created_by`
    - Add index on `prospects.converted_to_client_id`
    - Add index on `staging_imports.validated_by`
  
  2. Remove Unused Indexes
    - Drop 42 unused indexes that impact write performance
    - Keep only actively used indexes
  
  3. Fix Multiple Permissive Policies
    - Consolidate multiple SELECT policies into single policies
    - Affected tables: email_templates, prospects, staging_imports
  
  4. Security Notes
    - Leaked password protection must be enabled in Supabase Dashboard
    - Navigate to: Authentication > Settings > Password Protection
    - Enable "Check for compromised passwords"
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for email_templates.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by 
ON email_templates(created_by);

-- Index for prospects.converted_to_client_id foreign key
CREATE INDEX IF NOT EXISTS idx_prospects_converted_to_client_id 
ON prospects(converted_to_client_id);

-- Index for staging_imports.validated_by foreign key
CREATE INDEX IF NOT EXISTS idx_staging_imports_validated_by 
ON staging_imports(validated_by);

-- =====================================================
-- 2. DROP UNUSED INDEXES (Improve Write Performance)
-- =====================================================

-- Conversations table
DROP INDEX IF EXISTS idx_conversations_participants;
DROP INDEX IF EXISTS idx_conversations_project_id;
DROP INDEX IF EXISTS idx_conversations_last_message_at;
DROP INDEX IF EXISTS idx_conversations_created_by;

-- Messages table
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_messages_is_read;

-- Appointments table
DROP INDEX IF EXISTS idx_appointments_participants;
DROP INDEX IF EXISTS idx_appointments_project_id;
DROP INDEX IF EXISTS idx_appointments_start_time;
DROP INDEX IF EXISTS idx_appointments_end_time;
DROP INDEX IF EXISTS idx_appointments_created_by;
DROP INDEX IF EXISTS idx_appointments_status;

-- Projects table
DROP INDEX IF EXISTS projects_status_idx;
DROP INDEX IF EXISTS projects_created_at_idx;

-- Companies table
DROP INDEX IF EXISTS companies_siret_idx;
DROP INDEX IF EXISTS companies_status_idx;

-- Business providers table
DROP INDEX IF EXISTS business_providers_status_idx;

-- Documents table
DROP INDEX IF EXISTS documents_project_id_idx;

-- Commissions table
DROP INDEX IF EXISTS commissions_project_id_idx;
DROP INDEX IF EXISTS commissions_provider_id_idx;
DROP INDEX IF EXISTS commissions_status_idx;

-- Audit logs table
DROP INDEX IF EXISTS audit_logs_table_name_idx;
DROP INDEX IF EXISTS audit_logs_created_at_idx;

-- Staging imports table
DROP INDEX IF EXISTS idx_staging_imports_uploaded_by;
DROP INDEX IF EXISTS idx_staging_imports_status;
DROP INDEX IF EXISTS idx_staging_imports_entity_type;

-- Staging data table
DROP INDEX IF EXISTS idx_staging_data_import_id;
DROP INDEX IF EXISTS idx_staging_data_validation_status;
DROP INDEX IF EXISTS idx_staging_data_ingested;

-- Prospects table
DROP INDEX IF EXISTS idx_prospects_owner_id;
DROP INDEX IF EXISTS idx_prospects_status;
DROP INDEX IF EXISTS idx_prospects_email;
DROP INDEX IF EXISTS idx_prospects_next_action_date;

-- Prospection activities table
DROP INDEX IF EXISTS idx_prospection_activities_prospect_id;
DROP INDEX IF EXISTS idx_prospection_activities_user_id;
DROP INDEX IF EXISTS idx_prospection_activities_type;
DROP INDEX IF EXISTS idx_prospection_activities_created_at;

-- Email templates table (keep created_by, drop others)
DROP INDEX IF EXISTS idx_email_templates_category;
DROP INDEX IF EXISTS idx_email_templates_is_active;

-- =====================================================
-- 3. FIX MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- Fix email_templates policies
DROP POLICY IF EXISTS "All authenticated users can view active templates" ON email_templates;
DROP POLICY IF EXISTS "Managers can manage templates" ON email_templates;

CREATE POLICY "Authenticated users can view and manage templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (
    is_active = true OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can insert templates"
  ON email_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update templates"
  ON email_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can delete templates"
  ON email_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Fix prospects policies
DROP POLICY IF EXISTS "Managers can view all prospects" ON prospects;
DROP POLICY IF EXISTS "Users can view their own prospects" ON prospects;

CREATE POLICY "Users can view prospects based on role"
  ON prospects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can insert their own prospects"
  ON prospects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their prospects"
  ON prospects
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their prospects"
  ON prospects
  FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Fix staging_imports policies
DROP POLICY IF EXISTS "Managers can view all imports" ON staging_imports;
DROP POLICY IF EXISTS "Users can view their own imports" ON staging_imports;

CREATE POLICY "Users can view imports based on role"
  ON staging_imports
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can insert their own imports"
  ON staging_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their imports"
  ON staging_imports
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their imports"
  ON staging_imports
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );