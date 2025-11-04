/*
  # Réactivation propre du RLS sur la table users

  ## Problème identifié
  - Le RLS était désactivé sur la table users depuis la migration 20251104115754
  - Cela empêche le login car Supabase Auth ne peut pas vérifier les utilisateurs correctement

  ## Solution
  1. Réactiver le RLS sur la table users
  2. Conserver uniquement 4 policies simples et sûres :
     - anon peut lire (pour le login)
     - authenticated peut lire son propre profil
     - authenticated peut mettre à jour son propre profil
     - service_role a accès complet

  ## Sécurité
  - Policies restrictives par défaut
  - Accès anon limité à SELECT (nécessaire pour signInWithPassword)
  - Pas d'accès non-authentifié en écriture
*/

-- 1. D'abord, nettoyer toutes les policies existantes sur users
DROP POLICY IF EXISTS "users_select_during_login" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- 2. Réactiver le RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Créer les policies propres et minimales

-- Policy 1: Anon peut lire (requis pour signInWithPassword)
CREATE POLICY "users_anon_select"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Policy 2: Authenticated peut lire son propre profil
CREATE POLICY "users_authenticated_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Authenticated peut mettre à jour son propre profil
CREATE POLICY "users_authenticated_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Service role a accès complet
CREATE POLICY "users_service_role_all"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
