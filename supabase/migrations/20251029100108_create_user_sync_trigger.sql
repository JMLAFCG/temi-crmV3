/*
  # Create automatic user synchronization trigger

  1. Function
    - `handle_new_user()` - Automatically creates a user record in public.users when a new auth.users record is created
    
  2. Trigger
    - Fires on INSERT to auth.users
    - Copies id and email to public.users
    - Sets default role to 'client'
    
  3. Security
    - Function runs with SECURITY DEFINER to have permissions
    - Only creates records, never deletes or updates auth data
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'client',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();