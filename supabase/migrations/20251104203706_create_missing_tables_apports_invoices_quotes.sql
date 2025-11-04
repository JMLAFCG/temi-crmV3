/*
  # Create Missing Tables for Application Functionality

  ## New Tables Created

  1. **apports**
     - `id` (uuid, primary key)
     - `business_provider_id` (uuid, foreign key to business_providers)
     - `client_id` (uuid, foreign key to clients)
     - `project_id` (uuid, foreign key to projects, nullable)
     - `status` (text: pending, converted, rejected)
     - `description` (text)
     - `estimated_value` (numeric)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **invoices**
     - `id` (uuid, primary key)
     - `invoice_number` (text, unique)
     - `project_id` (uuid, foreign key to projects)
     - `client_id` (uuid, foreign key to clients)
     - `company_id` (uuid, foreign key to companies)
     - `amount` (numeric)
     - `tax_amount` (numeric)
     - `total_amount` (numeric)
     - `status` (text: draft, sent, paid, overdue, cancelled)
     - `issue_date` (date)
     - `due_date` (date)
     - `paid_date` (date, nullable)
     - `notes` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **quotes**
     - `id` (uuid, primary key)
     - `project_id` (uuid, foreign key to projects)
     - `company_id` (uuid, foreign key to companies)
     - `provider_id` (uuid, foreign key to business_providers, nullable)
     - `quote_number` (text)
     - `amount` (numeric)
     - `status` (text: pending, sent, accepted, rejected)
     - `valid_until` (date)
     - `description` (text)
     - `terms` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **quote_invitations**
     - `id` (uuid, primary key)
     - `quote_id` (uuid, foreign key to quotes)
     - `provider_id` (uuid, foreign key to business_providers)
     - `status` (text: pending, accepted, declined)
     - `invited_at` (timestamptz)
     - `responded_at` (timestamptz, nullable)
     - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users with role-based access
*/

-- ================================================
-- 1. CREATE APPORTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.apports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_provider_id uuid NOT NULL REFERENCES public.business_providers(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rejected')),
  description text,
  estimated_value numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.apports ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_apports_business_provider_id ON public.apports(business_provider_id);
CREATE INDEX IF NOT EXISTS idx_apports_client_id ON public.apports(client_id);
CREATE INDEX IF NOT EXISTS idx_apports_project_id ON public.apports(project_id);
CREATE INDEX IF NOT EXISTS idx_apports_status ON public.apports(status);
CREATE INDEX IF NOT EXISTS idx_apports_created_at ON public.apports(created_at DESC);

-- RLS Policies
CREATE POLICY "Authenticated users can view apports"
  ON public.apports
  FOR SELECT
  TO authenticated
  USING (
    business_provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Business providers can insert own apports"
  ON public.apports
  FOR INSERT
  TO authenticated
  WITH CHECK (business_provider_id = (select auth.uid()));

CREATE POLICY "Users can update apports"
  ON public.apports
  FOR UPDATE
  TO authenticated
  USING (
    business_provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete apports"
  ON public.apports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- ================================================
-- 2. CREATE INVOICES TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- RLS Policies
CREATE POLICY "Authenticated users can view invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Admins and managers can insert invoices"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update invoices"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete invoices"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- ================================================
-- 3. CREATE QUOTES TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.business_providers(id) ON DELETE SET NULL,
  quote_number text,
  amount numeric(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected')),
  valid_until date,
  description text,
  terms text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON public.quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_provider_id ON public.quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);

-- RLS Policies
CREATE POLICY "Authenticated users can view quotes"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.clients c ON p.client_id = c.id
      WHERE p.id = quotes.project_id
      AND c.user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Authorized users can insert quotes"
  ON public.quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Users can update their quotes"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (
    provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Admins can delete quotes"
  ON public.quotes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- ================================================
-- 4. CREATE QUOTE_INVITATIONS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.quote_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.business_providers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.quote_invitations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_invitations_quote_id ON public.quote_invitations(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_invitations_provider_id ON public.quote_invitations(provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_invitations_status ON public.quote_invitations(status);

-- RLS Policies
CREATE POLICY "Authenticated users can view quote invitations"
  ON public.quote_invitations
  FOR SELECT
  TO authenticated
  USING (
    provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Authorized users can insert quote invitations"
  ON public.quote_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Users can update quote invitations"
  ON public.quote_invitations
  FOR UPDATE
  TO authenticated
  USING (
    provider_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'manager', 'commercial')
    )
  );

CREATE POLICY "Admins can delete quote invitations"
  ON public.quote_invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );