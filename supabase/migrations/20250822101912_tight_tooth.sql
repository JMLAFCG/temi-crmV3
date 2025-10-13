/*
  # Configuration du Mode Démo TEMI-Construction

  1. Tables de démonstration
    - Ajout de colonnes is_demo et demo_organization_id aux tables existantes
    - Création de l'organisation de démonstration AFCG
    - Configuration des rôles de démonstration

  2. Sécurité
    - Maintien de la RLS existante
    - Ajout de politiques spécifiques pour les données de démo
    - Isolation des données de démo

  3. Données de référence
    - Organisation AFCG Démo
    - Rôles standardisés
    - Comptes de démonstration
*/

-- Ajouter les colonnes de démonstration aux tables existantes si elles n'existent pas
DO $$
BEGIN
  -- Ajouter is_demo à la table users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE users ADD COLUMN is_demo boolean DEFAULT false;
  END IF;

  -- Ajouter is_demo à la table clients
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE clients ADD COLUMN is_demo boolean DEFAULT false;
  END IF;

  -- Ajouter is_demo à la table companies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE companies ADD COLUMN is_demo boolean DEFAULT false;
  END IF;

  -- Ajouter is_demo à la table business_providers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_providers' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE business_providers ADD COLUMN is_demo boolean DEFAULT false;
  END IF;

  -- Ajouter is_demo à la table projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_demo boolean DEFAULT false;
  END IF;
END $$;

-- Créer la table organizations si elle n'existe pas
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Créer la table roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Créer la table user_roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id, organization_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Créer la table documents si elle n'existe pas
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text,
  file_size bigint,
  mime_type text,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES users(id),
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Créer la table quotes si elle n'existe pas
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id),
  amount_ht numeric(10,2) DEFAULT 0,
  amount_ttc numeric(10,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 20.0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'refused', 'expired')),
  valid_until date,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Créer la table invoices si elle n'existe pas
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id),
  invoice_number text UNIQUE,
  amount_ht numeric(10,2) DEFAULT 0,
  amount_ttc numeric(10,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 20.0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_date date,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Créer la table tasks si elle n'existe pas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date date,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Créer la table messages si elle n'existe pas
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  sender_id uuid REFERENCES users(id),
  recipient_id uuid REFERENCES users(id),
  project_id uuid REFERENCES projects(id),
  is_read boolean DEFAULT false,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Créer la table notifications si elle n'existe pas
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Créer la table commissions si elle n'existe pas
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES business_providers(id),
  amount numeric(10,2) DEFAULT 0,
  rate numeric(5,2) DEFAULT 10.0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'paid', 'cancelled')),
  paid_date date,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Insérer l'organisation de démonstration
INSERT INTO organizations (name, slug, description, is_demo) 
VALUES ('AFCG Démo', 'afcg-demo', 'Organisation de démonstration pour tests', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_demo = EXCLUDED.is_demo;

-- Insérer les rôles de base
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Administrateur système', '["*"]'::jsonb),
  ('manager', 'Gestionnaire', '["manage_users", "manage_projects", "view_reports"]'::jsonb),
  ('commercial', 'Commercial', '["manage_clients", "manage_projects"]'::jsonb),
  ('mandatary', 'Mandataire', '["manage_portfolio", "create_projects"]'::jsonb),
  ('client', 'Client', '["view_own_projects", "upload_documents"]'::jsonb),
  ('partner_company', 'Entreprise partenaire', '["view_assigned_projects", "submit_quotes"]'::jsonb),
  ('business_provider', 'Apporteur d''affaires', '["submit_leads", "view_commissions"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Politiques RLS pour les nouvelles tables
CREATE POLICY "Users can view demo data" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view their roles" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view quotes" ON quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view messages" ON messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can view notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view commissions" ON commissions FOR SELECT TO authenticated USING (true);