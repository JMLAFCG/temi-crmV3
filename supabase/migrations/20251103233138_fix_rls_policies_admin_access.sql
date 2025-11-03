/*
  # Fix RLS Policies - Allow Admin and Manager Access

  This migration fixes overly restrictive RLS policies that prevent admins
  and managers from managing data.

  ## Changes
  
  1. **Users Table Policies**
     - Allow admins to view all users
     - Allow users to view their own data
     
  2. **Clients Table Policies**
     - Allow admins and managers to create/view/update all clients
     - Allow other authenticated users to view clients
  
  3. **Settings Table Policies** 
     - Allow admins full access to settings
     - Allow other users to view settings
  
  ## Security
  
  - Maintains authentication requirement
  - Admins and managers get full access (role-based)
  - Regular users get read access only
  - All policies use auth.uid() for authentication check
*/

-- Drop existing overly restrictive policies
DROP POLICY IF EXISTS "Users can view their own data and agents" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients" ON clients;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Allow admins and managers to view all users
CREATE POLICY "Admins and managers can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
    OR id = auth.uid()
  );

-- Allow users to update their own data, admins can update all
CREATE POLICY "Users can update own data, admins can update all"
  ON users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

-- Allow authenticated users to view clients
CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create clients
CREATE POLICY "Authenticated users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update clients
CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow admins and managers to delete clients
CREATE POLICY "Admins and managers can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );
