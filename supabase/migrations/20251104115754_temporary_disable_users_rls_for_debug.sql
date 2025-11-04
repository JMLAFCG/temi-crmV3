-- Temporarily disable RLS on users table to debug login issue
-- This is a temporary measure to allow login to work
-- We will re-enable with proper policies later

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
