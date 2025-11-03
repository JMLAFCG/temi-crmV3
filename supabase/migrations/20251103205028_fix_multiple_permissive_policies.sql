/*
  # Correction des policies permissives multiples

  ## Problème
  Certaines tables ont plusieurs policies permissives pour la même action (SELECT),
  ce qui peut causer de la confusion et des problèmes de performance.

  ## Solution
  Fusionner les policies multiples en une seule policy avec conditions OR.

  ## Tables concernées
  - business_providers (2 SELECT policies → 1)
  - commissions (2 SELECT policies → 1)
  - companies (2 SELECT policies → 1)

  ## Sécurité
  - Logique de sécurité préservée
  - Clarté améliorée
  - Performance optimisée
*/

-- ============================================================================
-- BUSINESS_PROVIDERS - Fusion des policies SELECT
-- ============================================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view business providers" ON business_providers;
DROP POLICY IF EXISTS "Admins can manage business providers" ON business_providers;

-- Policy unifiée pour SELECT (users peuvent voir les leurs, admins voient tout)
CREATE POLICY "Business providers view policy"
  ON business_providers FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- Policy pour INSERT/UPDATE/DELETE (admins seulement)
CREATE POLICY "Admins can manage business providers"
  ON business_providers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update business providers"
  ON business_providers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete business providers"
  ON business_providers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- COMMISSIONS - Fusion des policies SELECT
-- ============================================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their commissions" ON commissions;
DROP POLICY IF EXISTS "Admins can manage commissions" ON commissions;

-- Policy unifiée pour SELECT (users voient leurs commissions, admins voient tout)
CREATE POLICY "Commissions view policy"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_providers
      WHERE business_providers.id = commissions.provider_id
      AND business_providers.user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- Policy pour INSERT/UPDATE/DELETE (admins seulement)
CREATE POLICY "Admins can create commissions"
  ON commissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update commissions"
  ON commissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete commissions"
  ON commissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- COMPANIES - Fusion des policies SELECT
-- ============================================================================

-- Supprimer l'ancienne policy "Admins can manage companies" qui couvrait tout
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;

-- Policy pour SELECT (tous les users authentifiés)
CREATE POLICY "Authenticated users can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour INSERT/UPDATE/DELETE (admins et managers seulement)
CREATE POLICY "Admins can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );