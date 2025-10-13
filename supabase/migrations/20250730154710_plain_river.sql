/*
  # Création de l'utilisateur administrateur principal

  1. Nouvel utilisateur
    - `email`: jml@afcg-courtage.com
    - `first_name`: Jean-Michel
    - `last_name`: Leroy
    - `role`: admin
    - `id`: Utilise l'UUID de l'utilisateur Supabase auth

  2. Sécurité
    - L'utilisateur sera créé dans la table users
    - Le mot de passe doit être défini via l'interface Supabase Auth
    - RLS appliqué selon les politiques existantes

  3. Notes importantes
    - Cet utilisateur aura tous les droits administrateur
    - Il pourra gérer tous les autres utilisateurs et données
    - Le mot de passe doit être configuré séparément dans Supabase Auth
*/

-- Insérer l'utilisateur administrateur principal
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'jml@afcg-courtage.com',
  'Jean-Michel',
  'Leroy',
  'admin',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = now();