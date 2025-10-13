/*
  # Add Performance Indexes

  1. Indexes for frequent queries
    - Projects: client_id, agent_id, status, created_at
    - Companies: siret, status, activities
    - Users: email, role
    - Messages: sender_id, recipient_id, is_read
    - Notifications: user_id, is_read, type
    - Commissions: project_id, provider_id, status
    - Quotes: project_id, company_id, status
    - Documents: project_id, uploaded_by

  2. Composite indexes for common queries
*/

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_agent_id ON projects(agent_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_business_provider_id ON projects(business_provider_id);

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_siret ON companies(siret);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON companies(verification_status);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_project_id ON commissions(project_id);
CREATE INDEX IF NOT EXISTS idx_commissions_provider_id ON commissions(provider_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at DESC);

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Business providers indexes
CREATE INDEX IF NOT EXISTS idx_business_providers_user_id ON business_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_business_providers_status ON business_providers(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_projects_status_client ON projects(status, client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status_provider ON commissions(status, provider_id);