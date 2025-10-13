/*
  # Add billing columns to projects table

  1. New Columns
    - amount (numeric): Project amount
    - commission_amount (numeric): Calculated commission (12% of amount)
    - commission_rate (numeric): Commission rate percentage
    - tax_rate (numeric): Tax rate percentage
    - billing_status (text): Current billing status

  2. Changes
    - Add columns with safe checks
    - Add constraints with existence checks
    - Create indexes for performance
*/

-- Add billing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'amount') THEN
    ALTER TABLE projects ADD COLUMN amount numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'commission_amount') THEN
    ALTER TABLE projects ADD COLUMN commission_amount numeric GENERATED ALWAYS AS (amount * 0.12) STORED;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'commission_rate') THEN
    ALTER TABLE projects ADD COLUMN commission_rate numeric DEFAULT 12.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tax_rate') THEN
    ALTER TABLE projects ADD COLUMN tax_rate numeric DEFAULT 20.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'billing_status') THEN
    ALTER TABLE projects ADD COLUMN billing_status text DEFAULT 'pending';
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'projects' AND constraint_name = 'projects_billing_status_check') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_billing_status_check CHECK (billing_status IN ('pending', 'invoiced', 'paid', 'cancelled'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'projects' AND constraint_name = 'projects_commission_rate_check') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_commission_rate_check CHECK (commission_rate >= 0 AND commission_rate <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'projects' AND constraint_name = 'projects_tax_rate_check') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_tax_rate_check CHECK (tax_rate >= 0 AND tax_rate <= 100);
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'projects_billing_status_idx') THEN
    CREATE INDEX projects_billing_status_idx ON projects(billing_status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'projects_amount_idx') THEN
    CREATE INDEX projects_amount_idx ON projects(amount);
  END IF;
END $$;