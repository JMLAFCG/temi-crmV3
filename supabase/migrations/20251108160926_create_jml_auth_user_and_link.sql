/*
  # Create JML Auth User and Link to Existing User
  
  1. Problem
    - JML user exists in public.users but not in auth.users
    - Can't login because there's no auth record
    - auth_user_id is NULL so RLS policies fail
    
  2. Solution
    - Create auth.users record for JML
    - Link it to existing public.users record via auth_user_id
    - Set a secure initial password
    
  3. Security
    - Password should be changed on first login
    - Uses bcrypt hashing via Supabase Auth
*/

-- Create the auth user for JML
-- Note: We use Supabase's admin API extension to create the user properly
DO $$
DECLARE
  new_auth_user_id uuid;
BEGIN
  -- Insert into auth.users (this is typically done via Supabase Auth API)
  -- We'll use a direct insert with proper password hashing
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'jml@afcg-courtage.com',
    crypt('AdminJML2024!', gen_salt('bf')),  -- Temporary password
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_auth_user_id;

  -- Update the public.users record to link it
  UPDATE users
  SET auth_user_id = new_auth_user_id
  WHERE email = 'jml@afcg-courtage.com';

  RAISE NOTICE 'Created auth user and linked to public.users for jml@afcg-courtage.com';
  RAISE NOTICE 'Auth User ID: %', new_auth_user_id;
  RAISE NOTICE 'Temporary password: AdminJML2024!';
END $$;
