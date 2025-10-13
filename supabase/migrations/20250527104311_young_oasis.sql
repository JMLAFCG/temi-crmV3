/*
  # Ajout du champ territoire pour les entreprises
  
  1. Nouvelle colonne
    - territory (jsonb): Stocke les informations de territoire
      - center: coordonnées du centre (lat/lng)
      - radius: rayon en kilomètres
  
  2. Index
    - Ajout d'un index GIN pour les recherches efficaces
*/

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS territory jsonb DEFAULT '{
  "center": {
    "lat": null,
    "lng": null
  },
  "radius": null
}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_companies_territory ON companies USING GIN (territory jsonb_path_ops);