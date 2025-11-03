/*
  # Cleanup Duplicate Policies - Final Fix
  
  1. Remove All Duplicate and Conflicting Policies
    - Clean up prospects table policies
    - Clean up staging_imports table policies
    - Keep only the consolidated policies from previous migration
  
  2. Verify Index Coverage
    - Ensure all foreign key indexes are in place
    
  This migration ensures no duplicate permissive policies remain.
*/

-- =====================================================
-- 1. CLEAN UP PROSPECTS TABLE POLICIES
-- =====================================================

-- Drop all duplicate/old policies
DROP POLICY IF EXISTS "Users can create prospects" ON prospects;
DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can update their own prospects" ON prospects;

-- Keep the consolidated policies from the previous migration:
-- "Users can view prospects based on role"
-- "Users can insert their own prospects"
-- "Users can update their prospects"
-- "Users can delete their prospects"

-- =====================================================
-- 2. CLEAN UP STAGING_IMPORTS TABLE POLICIES
-- =====================================================

-- Drop all duplicate/old policies
DROP POLICY IF EXISTS "Authenticated users can create imports" ON staging_imports;
DROP POLICY IF EXISTS "Managers can update imports" ON staging_imports;

-- Keep the consolidated policies from the previous migration:
-- "Users can view imports based on role"
-- "Users can insert their own imports"
-- "Users can update their imports"
-- "Users can delete their imports"

-- =====================================================
-- 3. VERIFY FOREIGN KEY INDEXES ARE IN PLACE
-- =====================================================

-- These should already exist from the previous migration, but ensure they're created
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by 
ON email_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_prospects_converted_to_client_id 
ON prospects(converted_to_client_id);

CREATE INDEX IF NOT EXISTS idx_staging_imports_validated_by 
ON staging_imports(validated_by);