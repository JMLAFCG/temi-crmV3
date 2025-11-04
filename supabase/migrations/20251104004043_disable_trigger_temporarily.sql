/*
  # Disable user sync trigger temporarily to fix login

  ## Problem
  - The trigger on auth.users may be causing "Database error querying schema"
  - This prevents login functionality

  ## Solution
  - Disable the trigger temporarily to allow login
  - The trigger is only needed during user creation, not during login

  ## Note
  - This will not affect existing users
  - New user registration will need the trigger re-enabled later
*/

-- Disable the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
