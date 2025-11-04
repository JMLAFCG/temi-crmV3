/*
  # Add company_id column to users table

  ## Problem
  - The application code expects a company_id column in the users table
  - This column is missing, causing "Database error querying schema" during login

  ## Solution
  - Add company_id column to users table
  - Make it nullable since existing users don't have a company
  - Add foreign key constraint to companies table

  ## Changes
  1. Add company_id column (uuid, nullable)
  2. Add foreign key constraint (if companies table exists)
*/

-- Add company_id column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE users ADD COLUMN company_id uuid;
  END IF;
END $$;

-- Add foreign key constraint if companies table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'companies'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'users_company_id_fkey'
    ) THEN
      ALTER TABLE users
        ADD CONSTRAINT users_company_id_fkey
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
