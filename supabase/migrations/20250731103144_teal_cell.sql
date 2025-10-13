/*
  # Ajout de la colonne company_category à la table companies

  1. Modifications de table
    - Ajout de la colonne `company_category` à la table `companies`
    - Type: text avec contrainte CHECK pour valeurs autorisées
    - Valeur par défaut: 'construction_partner'
    - Non nullable après mise à jour des données existantes

  2. Mise à jour des données
    - Toutes les entreprises existantes sont définies comme 'construction_partner' par défaut

  3. Contraintes
    - Contrainte CHECK pour limiter les valeurs à 'construction_partner' ou 'service_provider'
*/

-- Ajouter la colonne company_category avec une valeur par défaut temporaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'company_category'
  ) THEN
    ALTER TABLE companies ADD COLUMN company_category text DEFAULT 'construction_partner';
  END IF;
END $$;

-- Mettre à jour toutes les entreprises existantes avec la catégorie par défaut
UPDATE companies 
SET company_category = 'construction_partner' 
WHERE company_category IS NULL;

-- Rendre la colonne non nullable maintenant qu'elle a des valeurs
ALTER TABLE companies ALTER COLUMN company_category SET NOT NULL;

-- Ajouter une contrainte pour limiter les valeurs autorisées
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'companies_company_category_check'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_company_category_check 
    CHECK (company_category = ANY (ARRAY['construction_partner'::text, 'service_provider'::text]));
  END IF;
END $$;

-- Ajouter un index pour optimiser les requêtes par catégorie
CREATE INDEX IF NOT EXISTS companies_company_category_idx ON companies (company_category);