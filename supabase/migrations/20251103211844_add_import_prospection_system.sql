/*
  # Système d'import en masse et de prospection

  ## Nouvelles tables

  ### 1. staging_imports
  Table temporaire pour les données importées avant validation
  - `id` (uuid, primary key)
  - `uploaded_by` (uuid, foreign key → users)
  - `file_name` (text)
  - `file_url` (text)
  - `entity_type` (text) : 'company' | 'prospect'
  - `total_rows` (int)
  - `valid_rows` (int)
  - `invalid_rows` (int)
  - `status` (text) : 'pending' | 'validating' | 'approved' | 'rejected'
  - `validation_errors` (jsonb)
  - `validated_by` (uuid)
  - `validated_at` (timestamptz)
  - `rejection_reason` (text)
  - `created_at`, `updated_at`

  ### 2. staging_data
  Données brutes importées (avant ingestion)
  - `id` (uuid)
  - `import_id` (uuid, foreign key → staging_imports)
  - `row_number` (int)
  - `raw_data` (jsonb)
  - `mapped_data` (jsonb)
  - `validation_status` (text) : 'valid' | 'invalid' | 'duplicate'
  - `validation_errors` (jsonb)
  - `ingested` (boolean)
  - `created_at`

  ### 3. prospects
  Table pour les prospects (leads)
  - `id` (uuid)
  - `owner_id` (uuid, foreign key → users) - mandataire propriétaire
  - `company_name` (text)
  - `contact_first_name` (text)
  - `contact_last_name` (text)
  - `email` (text)
  - `phone` (text)
  - `address` (jsonb)
  - `industry` (text)
  - `status` (text) : 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  - `source` (text) : 'import' | 'manual' | 'referral'
  - `notes` (text)
  - `last_contact_date` (timestamptz)
  - `next_action_date` (timestamptz)
  - `converted_to_client_id` (uuid)
  - `created_at`, `updated_at`

  ### 4. prospection_activities
  Journal des actions de prospection
  - `id` (uuid)
  - `prospect_id` (uuid, foreign key → prospects)
  - `user_id` (uuid, foreign key → users)
  - `activity_type` (text) : 'email' | 'call' | 'meeting' | 'note'
  - `subject` (text)
  - `content` (text)
  - `outcome` (text)
  - `next_action` (text)
  - `next_action_date` (timestamptz)
  - `created_at`

  ### 5. email_templates
  Modèles d'emails pour la prospection
  - `id` (uuid)
  - `name` (text)
  - `subject` (text)
  - `body` (text)
  - `variables` (text[]) - liste des variables disponibles
  - `category` (text) : 'prospection' | 'follow_up' | 'thank_you'
  - `created_by` (uuid)
  - `is_active` (boolean)
  - `created_at`, `updated_at`

  ## Sécurité
  - RLS activé sur toutes les tables
  - Managers peuvent valider les imports
  - Mandataires voient uniquement leurs prospects
  - Audit logs pour toutes les actions
*/

-- ============================================================================
-- Table: staging_imports
-- ============================================================================

CREATE TABLE IF NOT EXISTS staging_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  entity_type text NOT NULL CHECK (entity_type IN ('company', 'prospect')),
  total_rows int NOT NULL DEFAULT 0,
  valid_rows int NOT NULL DEFAULT 0,
  invalid_rows int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'approved', 'rejected')),
  validation_errors jsonb DEFAULT '[]'::jsonb,
  validated_by uuid REFERENCES users(id),
  validated_at timestamptz,
  rejection_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staging_imports_uploaded_by ON staging_imports(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_staging_imports_status ON staging_imports(status);
CREATE INDEX IF NOT EXISTS idx_staging_imports_entity_type ON staging_imports(entity_type);

-- ============================================================================
-- Table: staging_data
-- ============================================================================

CREATE TABLE IF NOT EXISTS staging_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id uuid NOT NULL REFERENCES staging_imports(id) ON DELETE CASCADE,
  row_number int NOT NULL,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  mapped_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_status text NOT NULL DEFAULT 'valid' CHECK (validation_status IN ('valid', 'invalid', 'duplicate')),
  validation_errors jsonb DEFAULT '[]'::jsonb,
  ingested boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staging_data_import_id ON staging_data(import_id);
CREATE INDEX IF NOT EXISTS idx_staging_data_validation_status ON staging_data(validation_status);
CREATE INDEX IF NOT EXISTS idx_staging_data_ingested ON staging_data(ingested);

-- ============================================================================
-- Table: prospects
-- ============================================================================

CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  contact_first_name text,
  contact_last_name text,
  email text,
  phone text,
  address jsonb DEFAULT '{}'::jsonb,
  industry text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('import', 'manual', 'referral')),
  notes text,
  last_contact_date timestamptz,
  next_action_date timestamptz,
  converted_to_client_id uuid REFERENCES clients(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_owner_id ON prospects(owner_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_next_action_date ON prospects(next_action_date);

-- ============================================================================
-- Table: prospection_activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS prospection_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note')),
  subject text NOT NULL,
  content text,
  outcome text,
  next_action text,
  next_action_date timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospection_activities_prospect_id ON prospection_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospection_activities_user_id ON prospection_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_prospection_activities_type ON prospection_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_prospection_activities_created_at ON prospection_activities(created_at DESC);

-- ============================================================================
-- Table: email_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables text[] DEFAULT '{}'::text[],
  category text NOT NULL CHECK (category IN ('prospection', 'follow_up', 'thank_you', 'other')),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- staging_imports
ALTER TABLE staging_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own imports"
  ON staging_imports FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = uploaded_by);

CREATE POLICY "Managers can view all imports"
  ON staging_imports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Authenticated users can create imports"
  ON staging_imports FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = uploaded_by);

CREATE POLICY "Managers can update imports"
  ON staging_imports FOR UPDATE
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

-- staging_data
ALTER TABLE staging_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view staging data of their imports"
  ON staging_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staging_imports
      WHERE staging_imports.id = staging_data.import_id
      AND (staging_imports.uploaded_by = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        ))
    )
  );

-- prospects
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prospects"
  ON prospects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Managers can view all prospects"
  ON prospects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create prospects"
  ON prospects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can update their own prospects"
  ON prospects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can delete their own prospects"
  ON prospects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = owner_id);

-- prospection_activities
ALTER TABLE prospection_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities of their prospects"
  ON prospection_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = prospection_activities.prospect_id
      AND (prospects.owner_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        ))
    )
  );

CREATE POLICY "Users can create activities for their prospects"
  ON prospection_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = prospection_activities.prospect_id
      AND prospects.owner_id = (select auth.uid())
    )
  );

-- email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_staging_imports_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER staging_imports_updated_at_trigger
  BEFORE UPDATE ON staging_imports
  FOR EACH ROW
  EXECUTE FUNCTION update_staging_imports_updated_at();

CREATE OR REPLACE FUNCTION update_prospects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER prospects_updated_at_trigger
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_prospects_updated_at();

CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER email_templates_updated_at_trigger
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();