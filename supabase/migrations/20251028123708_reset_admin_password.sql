/*
  # Réinitialisation du mot de passe administrateur

  ## Objectif
  Réinitialiser le mot de passe de l'utilisateur admin@temi.com
  
  ## Nouveau mot de passe
  Le mot de passe sera: Admin123!
  
  ## Sécurité
  ⚠️ IMPORTANT: Changez ce mot de passe après la première connexion !
*/

-- Réinitialiser le mot de passe pour admin@temi.com
-- Le mot de passe sera: Admin123!
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@temi.com';