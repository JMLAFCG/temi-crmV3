/*
  # Create app_settings table for TEMI-Construction

  1. New Tables
    - `app_settings`
      - `id` (uuid, primary key)
      - `company_name` (text) - Nom de l'entreprise
      - `website` (text) - Site web
      - `email` (text) - Email de contact
      - `phone` (text) - Téléphone
      - `address` (text) - Adresse postale
      - `logo_url` (text) - URL du logo
      - `theme` (text) - Thème de l'application
      - `language` (text) - Langue par défaut
      - `timezone` (text) - Fuseau horaire
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `app_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin users to update settings

  3. Initial Data
    - Insert default TEMI-Construction settings
*/

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'TEMI-Construction',
  website text DEFAULT 'https://www.temi-construction.com',
  email text DEFAULT 'contact@temi-construction.com',
  phone text DEFAULT '02 35 77 18 90',
  address text DEFAULT '',
  logo_url text,
  theme text DEFAULT 'light',
  language text DEFAULT 'fr',
  timezone text DEFAULT 'Europe/Paris',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings (needed for login page, etc.)
CREATE POLICY "Anyone can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins can update settings
CREATE POLICY "Admins can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert default TEMI-Construction settings
INSERT INTO app_settings (
  id,
  company_name,
  website,
  email,
  phone,
  address,
  theme,
  language,
  timezone
) VALUES (
  'e409d6d1-fd6f-4453-b253-2b179bdedf87',
  'TEMI-Construction',
  'https://www.temi-construction.com',
  'contact@temi-construction.com',
  '02 35 77 18 90',
  '',
  'light',
  'fr',
  'Europe/Paris'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  website = EXCLUDED.website,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = now();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();