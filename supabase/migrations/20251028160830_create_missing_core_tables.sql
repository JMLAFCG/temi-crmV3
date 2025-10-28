/*
  # Création des tables principales manquantes

  1. Tables créées
    - companies (entreprises de construction/services)
    - business_providers (mandataires/apporteurs d'affaires)
    - documents (stockage de documents)
    - commissions (suivi des commissions)
    - audit_logs (journaux d'audit)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques basées sur les rôles

  3. Performance
    - Index sur les clés étrangères et champs fréquemment utilisés
*/

-- Table companies (entreprises)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  siret text UNIQUE,
  email text,
  phone text,
  address jsonb DEFAULT '{}'::jsonb,
  website text,
  description text,
  logo_url text,
  specialties text[] DEFAULT '{}',
  coverage_zones text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'manager'));

-- Table business_providers (mandataires/apporteurs)
CREATE TABLE IF NOT EXISTS business_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  company_name text NOT NULL,
  siret text,
  email text NOT NULL,
  phone text,
  address jsonb DEFAULT '{}'::jsonb,
  commission_rate numeric(5,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  specialties text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE business_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view business providers"
  ON business_providers FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary'));

CREATE POLICY "Admins can manage business providers"
  ON business_providers FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'manager'));

-- Table documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents of their projects"
  ON documents FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE client_id = auth.uid() OR agent_id = auth.uid()
    ) OR
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

CREATE POLICY "Users can upload documents to their projects"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE agent_id = auth.uid()
    ) OR
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

-- Table commissions
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES business_providers(id),
  amount numeric(12,2) NOT NULL,
  percentage numeric(5,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM business_providers WHERE user_id = auth.uid()
    ) OR
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

CREATE POLICY "Admins can manage commissions"
  ON commissions FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'manager'));

-- Table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Index pour performance
CREATE INDEX IF NOT EXISTS companies_siret_idx ON companies(siret);
CREATE INDEX IF NOT EXISTS companies_status_idx ON companies(status);
CREATE INDEX IF NOT EXISTS business_providers_user_id_idx ON business_providers(user_id);
CREATE INDEX IF NOT EXISTS business_providers_status_idx ON business_providers(status);
CREATE INDEX IF NOT EXISTS documents_project_id_idx ON documents(project_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_by_idx ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS commissions_project_id_idx ON commissions(project_id);
CREATE INDEX IF NOT EXISTS commissions_provider_id_idx ON commissions(provider_id);
CREATE INDEX IF NOT EXISTS commissions_status_idx ON commissions(status);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_table_name_idx ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);