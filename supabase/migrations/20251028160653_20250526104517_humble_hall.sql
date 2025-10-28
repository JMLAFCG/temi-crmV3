/*
  # Mise à jour de la table clients

  1. Structure
    - Table `clients` pour stocker les informations des clients
    - Relations avec la table auth.users
    - Champs pour les informations de l'entreprise
    - Support pour les adresses au format JSON
    - Horodatage de création et mise à jour

  2. Sécurité
    - Activation de RLS
    - Politiques pour la lecture, création, modification et suppression
    - Restrictions basées sur les rôles utilisateur

  3. Performance
    - Index sur user_id et created_at
*/

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients" ON clients;

-- Création ou mise à jour de la table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  company_name text,
  siret text,
  phone text,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Activation de RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Création des nouvelles politiques
CREATE POLICY "Users can view clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can create clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can update clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  )
  WITH CHECK (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can delete clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

-- Création ou mise à jour des index
DROP INDEX IF EXISTS clients_user_id_idx;
DROP INDEX IF EXISTS clients_created_at_idx;

CREATE INDEX clients_user_id_idx ON clients(user_id);
CREATE INDEX clients_created_at_idx ON clients(created_at);