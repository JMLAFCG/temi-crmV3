/*
  # Ajout de l'apporteur d'affaires aux projets

  1. Modifications
    - Ajout de la colonne business_provider_id (facultative)
    - Création d'une clé étrangère vers la table business_providers
    - Ajout d'un index pour optimiser les recherches
*/

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS business_provider_id uuid REFERENCES business_providers(id);

-- Création de l'index
CREATE INDEX IF NOT EXISTS projects_business_provider_id_idx ON projects(business_provider_id);