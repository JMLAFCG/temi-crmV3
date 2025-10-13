/*
  # Database Schema Setup
  
  1. Tables
    - users (authentication and user data)
    - clients (client information)
    - projects (project management)
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for CRUD operations
    
  3. Indexes
    - Add performance optimization indexes
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data and agents" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create project_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM (
      'draft',
      'pending',
      'in_progress',
      'completed',
      'cancelled'
    );
  END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'commercial', 'mandatary', 'client')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create clients table
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

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status project_status NOT NULL DEFAULT 'draft',
  client_id uuid REFERENCES public.users(id),
  agent_id uuid REFERENCES public.users(id),
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  surface jsonb NOT NULL DEFAULT '{}'::jsonb,
  budget jsonb NOT NULL DEFAULT '{}'::jsonb,
  timeline jsonb NOT NULL DEFAULT '{}'::jsonb,
  activities text[] DEFAULT '{}',
  intellectual_services text[] DEFAULT '{}',
  additional_services text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

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

-- Create policies for projects table
CREATE POLICY "Users can view their own projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = agent_id OR
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

CREATE POLICY "Users can create projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' IN ('admin', 'manager', 'commercial', 'mandatary')
  );

CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = agent_id OR
    auth.jwt()->>'role' IN ('admin', 'manager')
  )
  WITH CHECK (
    auth.uid() = agent_id OR
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = agent_id OR
    auth.jwt()->>'role' IN ('admin', 'manager')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON public.clients(created_at);
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS projects_agent_id_idx ON public.projects(agent_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at);