/*
  # Mise à jour du schéma des entreprises
  
  1. Nouvelles colonnes
    - Documents d'assurance (RC Pro, Décennale)
    - Sinistralité
    - Vérifications INSEE
    - Documents administratifs
    - Suivi qualité
    - Alertes et relances
  
  2. Index et recherche
    - Index sur les dates d'expiration
    - Index sur les documents
    
  3. Automatisation
    - Trigger pour vérification des dates
    - Alertes automatiques
*/

-- Ajout des colonnes pour les documents d'assurance
ALTER TABLE companies ADD COLUMN IF NOT EXISTS insurance_documents jsonb DEFAULT '{
  "rc_pro": {
    "number": null,
    "company": null,
    "valid_from": null,
    "valid_until": null,
    "coverage_amount": null,
    "status": "pending",
    "last_verified": null
  },
  "decennale": {
    "number": null,
    "company": null,
    "valid_from": null,
    "valid_until": null,
    "coverage_amount": null,
    "status": "pending",
    "last_verified": null
  }
}'::jsonb;

-- Ajout des colonnes pour la sinistralité
ALTER TABLE companies ADD COLUMN IF NOT EXISTS claims jsonb DEFAULT '{
  "current_year": {
    "count": 0,
    "total_amount": 0,
    "open_claims": []
  },
  "history": []
}'::jsonb;

-- Ajout des colonnes pour les vérifications INSEE
ALTER TABLE companies ADD COLUMN IF NOT EXISTS insee_verification jsonb DEFAULT '{
  "last_check": null,
  "status": "pending",
  "legal_status": null,
  "creation_date": null,
  "principal_activity": null,
  "secondary_activities": [],
  "employees_range": null,
  "turnover_range": null
}'::jsonb;

-- Ajout des colonnes pour les documents administratifs
ALTER TABLE companies ADD COLUMN IF NOT EXISTS administrative_documents jsonb DEFAULT '{
  "kbis": {
    "number": null,
    "issue_date": null,
    "valid_until": null,
    "status": "pending",
    "last_verified": null
  },
  "urssaf": {
    "number": null,
    "valid_until": null,
    "status": "pending",
    "last_verified": null
  },
  "fiscal": {
    "number": null,
    "valid_until": null,
    "status": "pending",
    "last_verified": null
  }
}'::jsonb;

-- Ajout des colonnes pour le suivi qualité
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quality_tracking jsonb DEFAULT '{
  "certifications": [],
  "qualifications": [],
  "ratings": {
    "average": null,
    "count": 0,
    "details": []
  },
  "incidents": []
}'::jsonb;

-- Ajout des colonnes pour les alertes et relances
ALTER TABLE companies ADD COLUMN IF NOT EXISTS alerts jsonb DEFAULT '[]'::jsonb;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS reminders jsonb DEFAULT '[]'::jsonb;

-- Création des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_companies_insurance_docs ON companies USING gin (insurance_documents jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_companies_claims ON companies USING gin (claims jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_companies_insee ON companies USING gin (insee_verification jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_companies_admin_docs ON companies USING gin (administrative_documents jsonb_path_ops);

-- Fonction pour vérifier les dates d'expiration des documents
CREATE OR REPLACE FUNCTION check_document_expiration()
RETURNS trigger AS $$
BEGIN
  -- Vérification des dates d'assurance
  IF (NEW.insurance_documents->>'rc_pro'->>'valid_until')::date < CURRENT_DATE THEN
    NEW.alerts = jsonb_set(
      COALESCE(NEW.alerts, '[]'::jsonb),
      '{-1}',
      jsonb_build_object(
        'type', 'insurance_expired',
        'document', 'rc_pro',
        'expiry_date', NEW.insurance_documents->>'rc_pro'->>'valid_until',
        'created_at', CURRENT_TIMESTAMP
      )
    );
  END IF;

  IF (NEW.insurance_documents->>'decennale'->>'valid_until')::date < CURRENT_DATE THEN
    NEW.alerts = jsonb_set(
      COALESCE(NEW.alerts, '[]'::jsonb),
      '{-1}',
      jsonb_build_object(
        'type', 'insurance_expired',
        'document', 'decennale',
        'expiry_date', NEW.insurance_documents->>'decennale'->>'valid_until',
        'created_at', CURRENT_TIMESTAMP
      )
    );
  END IF;

  -- Vérification des documents administratifs
  IF (NEW.administrative_documents->>'kbis'->>'valid_until')::date < CURRENT_DATE THEN
    NEW.alerts = jsonb_set(
      COALESCE(NEW.alerts, '[]'::jsonb),
      '{-1}',
      jsonb_build_object(
        'type', 'document_expired',
        'document', 'kbis',
        'expiry_date', NEW.administrative_documents->>'kbis'->>'valid_until',
        'created_at', CURRENT_TIMESTAMP
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger pour la vérification automatique
DROP TRIGGER IF EXISTS check_company_documents ON companies;
CREATE TRIGGER check_company_documents
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION check_document_expiration();

-- Mise à jour des politiques de sécurité
DROP POLICY IF EXISTS "Commerciaux peuvent voir les documents des entreprises" ON companies;
CREATE POLICY "Commerciaux peuvent voir les documents des entreprises"
  ON companies
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'commercial');

DROP POLICY IF EXISTS "Mandataires peuvent voir les documents des entreprises" ON companies;
CREATE POLICY "Mandataires peuvent voir les documents des entreprises"
  ON companies
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'mandatary');