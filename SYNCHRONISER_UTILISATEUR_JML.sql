-- ============================================================================
-- SYNCHRONISER L'UTILISATEUR jml@afcg-courtage.com
-- ============================================================================
-- À exécuter dans: Supabase Dashboard > SQL Editor
-- Project: cgyucfxdutvjclptfsme (TEMI MANAGER)
-- ============================================================================

-- Votre utilisateur existe déjà dans auth.users:
-- UID: 96052d78-309e-416f-950b-cd5b2dec5695
-- Email: jml@afcg-courtage.com

-- ============================================================================
-- ÉTAPE 1: Vérifier l'utilisateur dans auth.users
-- ============================================================================

SELECT
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'jml@afcg-courtage.com';

-- Vous devriez voir votre utilisateur

-- ============================================================================
-- ÉTAPE 2: Créer/Mettre à jour dans public.users
-- ============================================================================

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
VALUES (
  '96052d78-309e-416f-950b-cd5b2dec5695',
  '96052d78-309e-416f-950b-cd5b2dec5695',
  'jml@afcg-courtage.com',
  'Jean-Marc',
  'Leton',
  'admin',
  '+33 6 00 00 00 00',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = 'jml@afcg-courtage.com',
  first_name = 'Jean-Marc',
  last_name = 'Leton',
  auth_user_id = '96052d78-309e-416f-950b-cd5b2dec5695',
  updated_at = NOW();

-- ============================================================================
-- ÉTAPE 3: Vérifier
-- ============================================================================

SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  auth_user_id
FROM public.users
WHERE email = 'jml@afcg-courtage.com';

-- Vous devriez voir:
-- id: 96052d78-309e-416f-950b-cd5b2dec5695
-- email: jml@afcg-courtage.com
-- role: admin
-- auth_user_id: 96052d78-309e-416f-950b-cd5b2dec5695

-- ============================================================================
-- ÉTAPE 4: Nettoyer les données d'exemple (si nécessaire)
-- ============================================================================

-- Supprimer toutes les données d'exemple
DELETE FROM projects;
DELETE FROM clients;
DELETE FROM companies;
DELETE FROM business_providers;
DELETE FROM commissions;

-- Nettoyer app_settings
DELETE FROM app_settings;

INSERT INTO app_settings (id, key, value, description, updated_at)
VALUES
  (gen_random_uuid(), 'company_name', '""'::jsonb, 'Nom de l''entreprise', NOW()),
  (gen_random_uuid(), 'company_website', '""'::jsonb, 'Site web', NOW()),
  (gen_random_uuid(), 'company_email', '""'::jsonb, 'Email de contact', NOW()),
  (gen_random_uuid(), 'company_phone', '""'::jsonb, 'Téléphone', NOW()),
  (gen_random_uuid(), 'company_address', '""'::jsonb, 'Adresse', NOW()),
  (gen_random_uuid(), 'default_commission_rate', '10'::jsonb, 'Taux de commission par défaut (%)', NOW()),
  (gen_random_uuid(), 'default_tax_rate', '20'::jsonb, 'Taux de TVA par défaut (%)', NOW());

-- ============================================================================
-- RÉSULTAT:
-- ============================================================================
-- Après avoir exécuté ce script:
-- 1. Déconnectez-vous de l'application
-- 2. Videz le cache (Ctrl+Shift+R)
-- 3. Reconnectez-vous avec jml@afcg-courtage.com
-- 4. Vous aurez accès à TOUTES les pages!
-- ============================================================================
