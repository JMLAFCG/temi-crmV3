/*
  # Création du système de demandes d'inscription

  1. Nouvelle table `registration_requests`
    - `id` (uuid, clé primaire)
    - `email` (text, unique) - Email du demandeur
    - `first_name` (text) - Prénom
    - `last_name` (text) - Nom
    - `phone` (text) - Téléphone
    - `company_name` (text, optionnel) - Nom de l'entreprise
    - `siret` (text, optionnel) - SIRET de l'entreprise
    - `requested_role` (text) - Rôle demandé (mandataire, apporteur, partner_company)
    - `motivation` (text) - Message de motivation
    - `status` (text) - Statut: 'pending', 'approved', 'rejected'
    - `reviewed_by` (uuid, foreign key) - Admin qui a traité la demande
    - `reviewed_at` (timestamptz) - Date de traitement
    - `rejection_reason` (text, optionnel) - Raison du rejet
    - `created_user_id` (uuid, optionnel) - ID de l'utilisateur créé après validation
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `registration_requests`
    - Policy pour admins/managers (lecture/modification)
    - Policy pour création publique (INSERT seulement)
    
  3. Index
    - Index sur email pour recherche rapide
    - Index sur status pour filtrage
*/

-- Créer la table des demandes d'inscription
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  company_name text,
  siret text,
  requested_role text NOT NULL CHECK (requested_role IN ('mandataire', 'apporteur', 'partner_company')),
  motivation text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Admins et managers peuvent tout voir
CREATE POLICY "Admins and managers can view all registration requests"
  ON registration_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

-- Policy: Admins et managers peuvent mettre à jour
CREATE POLICY "Admins and managers can update registration requests"
  ON registration_requests
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

-- Policy: Tout le monde peut créer une demande (formulaire public)
CREATE POLICY "Anyone can create registration request"
  ON registration_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);

-- Fonction pour compter les demandes en attente (pour le badge de notification)
CREATE OR REPLACE FUNCTION count_pending_registration_requests()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM registration_requests WHERE status = 'pending';
$$;
