/*
  # Ajout des champs de facturation

  1. Nouvelles colonnes
    - `amount` (numeric): Montant HT du devis/facture
    - `commission_amount` (numeric): Montant de la commission (12% TTC)
    - `commission_rate` (numeric): Taux de commission fixé à 12%
    - `tax_rate` (numeric): Taux de TVA (20%)
    - `billing_status` (text): Statut de la facturation

  2. Contraintes
    - Vérification des montants positifs
    - Vérification du taux de commission
*/

-- Ajout des colonnes de facturation aux projets
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_amount numeric GENERATED ALWAYS AS (amount * 0.12) STORED,
ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 12.0,
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 20.0,
ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'pending'
  CHECK (billing_status IN ('pending', 'invoiced', 'paid', 'cancelled'));

-- Ajout des contraintes
ALTER TABLE projects
ADD CONSTRAINT projects_amount_check CHECK (amount >= 0),
ADD CONSTRAINT projects_commission_rate_check CHECK (commission_rate >= 0 AND commission_rate <= 100),
ADD CONSTRAINT projects_tax_rate_check CHECK (tax_rate >= 0 AND tax_rate <= 100);

-- Création d'index pour les recherches
CREATE INDEX IF NOT EXISTS projects_billing_status_idx ON projects(billing_status);
CREATE INDEX IF NOT EXISTS projects_amount_idx ON projects(amount);