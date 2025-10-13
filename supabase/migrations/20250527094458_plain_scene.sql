/*
  # Ajout des colonnes de facturation aux projets

  1. Nouvelles colonnes
    - amount (montant du projet)
    - commission_amount (calculé automatiquement à 12% du montant)
    - commission_rate (taux de commission fixé à 12%)
    - tax_rate (taux de TVA fixé à 20%)
    - billing_status (statut de facturation)

  2. Modifications
    - Ajout des colonnes uniquement si elles n'existent pas
    - Vérification des contraintes existantes
    - Création des index nécessaires
*/

-- Ajout des colonnes si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'amount') THEN
    ALTER TABLE projects ADD COLUMN amount numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'commission_amount') THEN
    ALTER TABLE projects ADD COLUMN commission_amount numeric GENERATED ALWAYS AS (amount * 0.12) STORED;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'commission_rate') THEN
    ALTER TABLE projects ADD COLUMN commission_rate numeric DEFAULT 12.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tax_rate') THEN
    ALTER TABLE projects ADD COLUMN tax_rate numeric DEFAULT 20.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'billing_status') THEN
    ALTER TABLE projects ADD COLUMN billing_status text DEFAULT 'pending';
  END IF;
END $$;

-- Ajout des contraintes si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'projects' AND constraint_name = 'projects_billing_status_check') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_billing_status_check CHECK (billing_status IN ('pending', 'invoiced', 'paid', 'cancelled'));
  END IF;
END $$;

-- Création des index si nécessaire
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'projects_billing_status_idx') THEN
    CREATE INDEX projects_billing_status_idx ON projects(billing_status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'projects_amount_idx') THEN
    CREATE INDEX projects_amount_idx ON projects(amount);
  END IF;
END $$;