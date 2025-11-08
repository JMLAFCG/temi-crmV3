-- ============================================================================
-- CRÉER L'UTILISATEUR jml@afcg-courtage.com
-- ============================================================================
-- À exécuter dans: Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: CRÉER L'UTILISATEUR DANS AUTH.USERS
-- ============================================================================
-- IMPORTANT: Cette requête NE PEUT PAS être exécutée via SQL Editor!
-- Vous DEVEZ le créer via l'interface Dashboard

-- Allez dans: Authentication > Users > Add user > Create new user
-- Email: jml@afcg-courtage.com
-- Password: (votre mot de passe actuel ou un nouveau)
-- ✓ Confirm email
-- User Metadata (JSON):
-- {
--   "first_name": "Jean-Marc",
--   "last_name": "Leton",
--   "role": "admin"
-- }

-- Une fois créé, exécutez les requêtes ci-dessous

-- ============================================================================
-- ÉTAPE 2: SYNCHRONISER AVEC PUBLIC.USERS
-- ============================================================================

-- Cette requête prend l'utilisateur jml@afcg-courtage.com de auth.users
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
  'admin',
  '+33 6 00 00 00 00',
  false,
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'jml@afcg-courtage.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, users.first_name),
  last_name = COALESCE(EXCLUDED.last_name, users.last_name),
  auth_user_id = EXCLUDED.auth_user_id,
  updated_at = NOW();

-- ============================================================================
-- ÉTAPE 3: VÉRIFIER
-- ============================================================================

SELECT
  'auth.users' as source,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.raw_user_meta_data->>'role' as meta_role
FROM auth.users au
WHERE au.email = 'jml@afcg-courtage.com'
UNION ALL
SELECT
  'public.users' as source,
  u.id,
  u.email,
  u.created_at::text,
  u.updated_at::text,
  u.role
FROM public.users u
WHERE u.email = 'jml@afcg-courtage.com';

-- Si vous voyez 2 lignes (une pour auth.users et une pour public.users)
-- avec le même ID, c'est parfait!

-- ============================================================================
-- ÉTAPE 4: NETTOYER APP_SETTINGS (valeurs vides pour que vous les remplissiez)
-- ============================================================================

DELETE FROM app_settings WHERE key IN (
  'company_name', 'company_website', 'company_email',
  'company_phone', 'company_address'
);

INSERT INTO app_settings (id, key, value, description, updated_at)
VALUES
  (gen_random_uuid(), 'company_name', '""'::jsonb, 'Nom de l''entreprise', NOW()),
  (gen_random_uuid(), 'company_website', '""'::jsonb, 'Site web', NOW()),
  (gen_random_uuid(), 'company_email', '""'::jsonb, 'Email de contact', NOW()),
  (gen_random_uuid(), 'company_phone', '""'::jsonb, 'Téléphone', NOW()),
  (gen_random_uuid(), 'company_address', '""'::jsonb, 'Adresse', NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

SELECT key, value FROM app_settings ORDER BY key;

-- ============================================================================
-- RÉSULTAT ATTENDU:
-- ============================================================================
-- Après ces étapes:
-- 1. Déconnectez-vous
-- 2. Videz le cache (Ctrl+Shift+R)
-- 3. Reconnectez-vous avec jml@afcg-courtage.com
-- 4. Vous aurez accès à TOUTES les pages!
-- ============================================================================
