/*
  # Initial Schema Setup

  1. Tables
    - Creates users table with role-based access control
    - Creates clients table with user references
    - Sets up all necessary indexes and constraints

  2. Security
    - Enables Row Level Security (RLS) on all tables
    - Creates appropriate access policies for each table
    - Ensures data access is properly restricted based on user roles

  3. Changes
    - Drops existing policies to avoid conflicts
    - Creates fresh schema with proper constraints
    - Sets up all necessary indexes
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data and agents" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'commercial', 'mandatary', 'client')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data and agents"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create clients table if not exists
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  company_name text,
  siret text,
  phone text,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Users can view clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can create clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can update clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  )
  WITH CHECK (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can delete clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON public.clients(created_at);