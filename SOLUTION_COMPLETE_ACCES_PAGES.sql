-- ============================================================================
-- SOLUTION COMPLÈTE POUR ACCÉDER AUX PAGES
-- ============================================================================
-- IMPORTANT: Exécutez ces étapes dans l'ordre!
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: CRÉER L'UTILISATEUR DANS AUTH.USERS VIA LE DASHBOARD
-- ============================================================================
-- 1. Allez dans: Supabase Dashboard > Authentication > Users
-- 2. Cliquez sur "Add user" > "Create new user"
-- 3. Remplissez:
--    Email: jean-marc.leton@temi.com
--    Password: (choisissez un mot de passe sécurisé)
--    Cochez "Confirm email" ✓
--    User Metadata (JSON):
--    {
--      "first_name": "Jean-Marc",
--      "last_name": "Leton",
--      "role": "admin"
--    }
-- 4. Cliquez "Create user"
-- 5. NOTEZ L'ID DE L'UTILISATEUR CRÉÉ (vous en aurez besoin)
-- ============================================================================

-- ============================================================================
-- ÉTAPE 2: CRÉER L'ENTRÉE DANS PUBLIC.USERS
-- ============================================================================
-- Exécutez ce SQL dans: SQL Editor

-- Cette requête prend automatiquement le dernier utilisateur créé dans auth.users
-- et crée l'entrée correspondante dans public.users

INSERT INTO public.users (
  id,
  auth_user_id,
  email,
  first_name,
  last_name,
  role,
  phone,
  is_demo,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Jean-Marc'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Leton'),
  COALESCE(au.raw_user_meta_data->>'role', 'admin'),
  '+33 6 00 00 00 00',
  false,
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email LIKE '%@temi.com' OR au.email LIKE '%@%'
ORDER BY au.created_at DESC
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  role = COALESCE(EXCLUDED.role, 'admin'),
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, users.first_name),
  last_name = COALESCE(EXCLUDED.last_name, users.last_name),
  auth_user_id = EXCLUDED.auth_user_id,
  updated_at = NOW();

-- ============================================================================
-- ÉTAPE 3: VÉRIFIER QUE TOUT EST OK
-- ============================================================================

-- Vérifier l'utilisateur dans auth.users
SELECT
  'auth.users' as table_name,
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'role' as meta_role
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 1;

-- Vérifier l'utilisateur dans public.users
SELECT
  'public.users' as table_name,
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.auth_user_id,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 1;

-- Vérifier que les IDs correspondent
SELECT
  CASE
    WHEN au.id = u.id AND au.id = u.auth_user_id THEN '✅ IDs correspondent - Tout est OK!'
    WHEN au.id IS NULL THEN '❌ Utilisateur manquant dans auth.users'
    WHEN u.id IS NULL THEN '❌ Utilisateur manquant dans public.users'
    ELSE '⚠️  Les IDs ne correspondent pas - Problème de synchronisation'
  END as status,
  au.id as auth_id,
  u.id as public_id,
  u.auth_user_id as public_auth_user_id
FROM auth.users au
FULL OUTER JOIN public.users u ON au.id = u.auth_user_id
ORDER BY au.created_at DESC NULLS LAST
LIMIT 1;

-- ============================================================================
-- ÉTAPE 4: NETTOYER LES PARAMÈTRES DE L'APPLICATION
-- ============================================================================

-- Mettre à jour app_settings avec des valeurs vides (à remplir par l'utilisateur)
UPDATE app_settings SET value = '""'::jsonb, updated_at = NOW() WHERE key = 'company_name';
UPDATE app_settings SET value = '""'::jsonb, updated_at = NOW() WHERE key = 'company_website';
UPDATE app_settings SET value = '""'::jsonb, updated_at = NOW() WHERE key = 'company_email';
UPDATE app_settings SET value = '""'::jsonb, updated_at = NOW() WHERE key = 'company_phone';
UPDATE app_settings SET value = '""'::jsonb, updated_at = NOW() WHERE key = 'company_address';

-- Vérifier
SELECT key, value FROM app_settings ORDER BY key;

-- ============================================================================
-- RÉSULTAT ATTENDU:
-- ============================================================================
-- Vous devriez voir:
-- 1. Un utilisateur dans auth.users avec votre email
-- 2. Le même utilisateur dans public.users avec role = 'admin'
-- 3. Les IDs qui correspondent entre les deux tables
-- 4. app_settings avec des valeurs vides
-- ============================================================================

-- ============================================================================
-- APRÈS CES ÉTAPES:
-- ============================================================================
-- 1. Déconnectez-vous de l'application
-- 2. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
-- 3. Reconnectez-vous avec l'email et le mot de passe que vous avez créés
-- 4. Vous aurez accès à TOUTES les pages:
--    - ✅ Clients
--    - ✅ Projets
--    - ✅ Entreprises
--    - ✅ Apporteurs
--    - ✅ Administration
-- 5. Allez dans Administration > Général pour remplir les infos de l'entreprise
-- 6. Créez vos premiers clients, projets, etc.
-- ============================================================================
