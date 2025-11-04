/*
  # Reset admin password to fix login

  Reset the password for jml@afcg-courtage.com to: Admin123!
  
  This allows the admin to login immediately.
*/

-- Update password for admin user
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'jml@afcg-courtage.com';
