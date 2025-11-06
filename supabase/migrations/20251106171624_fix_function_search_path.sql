/*
  # Fix Function Search Path Security

  1. Security Fix
    - Add IMMUTABLE or STABLE to function that has mutable search_path
    - Set explicit search_path to prevent injection attacks
    
  2. Function Being Fixed
    - count_pending_registration_requests
    
  3. Security Improvement
    - Prevents search_path manipulation attacks
    - Makes function execution deterministic
*/

-- Drop and recreate function with proper security settings
DROP FUNCTION IF EXISTS count_pending_registration_requests();

CREATE OR REPLACE FUNCTION count_pending_registration_requests()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(*)::bigint
  FROM registration_requests
  WHERE status = 'pending';
$$;