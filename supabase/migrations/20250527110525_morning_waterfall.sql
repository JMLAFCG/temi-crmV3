/*
  # Ajout du logo et des informations de devis pour les entreprises

  1. Nouvelles colonnes
    - `logo` (jsonb): Stockage des informations du logo
    - `documents` (jsonb): Stockage des documents incluant les devis
    - `quotes` (jsonb): Historique des devis soumis

  2. Modifications
    - Ajout des colonnes avec valeurs par défaut
    - Création d'index pour les recherches
*/

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS logo jsonb DEFAULT '{
  "url": null,
  "alt": null,
  "uploaded_at": null
}'::jsonb;

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '{
  "kbis": null,
  "urssaf": null,
  "decennial": null,
  "insurance": null,
  "quotes": []
}'::jsonb;

-- Création des index
CREATE INDEX IF NOT EXISTS idx_companies_logo ON companies USING gin (logo jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_companies_documents ON companies USING gin (documents jsonb_path_ops);