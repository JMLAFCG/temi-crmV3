/*
  # Create Application Settings Table

  ## Summary
  Creates a single-row table to store application-wide settings like company name, website, email, etc.

  ## Changes Made
  
  1. **New Table: `app_settings`**
     - `id` (uuid, primary key) - Single record identifier
     - `company_name` (text) - Company name
     - `website` (text) - Company website URL
     - `email` (text) - Company contact email
     - `phone` (text) - Company phone number
     - `address` (text) - Company address
     - `logo_url` (text, nullable) - URL to company logo
     - `theme` (text) - UI theme preference (light/dark/system)
     - `language` (text) - Application language (fr/en)
     - `timezone` (text) - Default timezone
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  2. **Security**
     - Enable RLS on `app_settings` table
     - Allow all authenticated users to read settings
     - Only admins and managers can update settings

  3. **Default Data**
     - Insert default settings record with TEMI-Construction data
*/

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'TEMI-Construction',
  website text DEFAULT 'https://temi-construction.fr',
  email text DEFAULT 'contact@temi-construction.fr',
  phone text DEFAULT '01 23 45 67 89',
  address text DEFAULT '123 Rue de la Construction, 75001 Paris',
  logo_url text,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  timezone text NOT NULL DEFAULT 'Europe/Paris',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read settings
CREATE POLICY "Authenticated users can view settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and managers can update settings
CREATE POLICY "Admins and managers can update settings"
  ON public.app_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

-- Insert default settings (only if table is empty)
INSERT INTO public.app_settings (id, company_name, website, email, phone, address, theme, language, timezone)
SELECT 
  gen_random_uuid(),
  'TEMI-Construction',
  'https://temi-construction.fr',
  'contact@temi-construction.fr',
  '01 23 45 67 89',
  '123 Rue de la Construction, 75001 Paris',
  'light',
  'fr',
  'Europe/Paris'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON public.app_settings(updated_at);