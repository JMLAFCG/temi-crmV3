/*
  # Fix Foreign Key Indexes for Performance

  1. Performance Optimization
    - Add indexes on all foreign key columns that don't have covering indexes
    - This improves JOIN performance and query optimization
    
  2. Tables with Missing FK Indexes
    - documents.uploaded_by
    - invoices.quote_id
    - messages.project_id
    - projects.business_provider_id
    - quotes.company_id
    - registration_requests.created_user_id
    - registration_requests.reviewed_by
    - user_roles.organization_id
    - user_roles.role_id
    
  3. Security
    - No changes to RLS policies
    - Improves query performance for secure data access
*/

-- Add index for documents.uploaded_by foreign key
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by 
ON documents(uploaded_by);

-- Add index for invoices.quote_id foreign key
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id 
ON invoices(quote_id);

-- Add index for messages.project_id foreign key
CREATE INDEX IF NOT EXISTS idx_messages_project_id 
ON messages(project_id);

-- Add index for projects.business_provider_id foreign key
CREATE INDEX IF NOT EXISTS idx_projects_business_provider_id 
ON projects(business_provider_id);

-- Add index for quotes.company_id foreign key
CREATE INDEX IF NOT EXISTS idx_quotes_company_id 
ON quotes(company_id);

-- Add index for registration_requests.created_user_id foreign key
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_user_id 
ON registration_requests(created_user_id);

-- Add index for registration_requests.reviewed_by foreign key
CREATE INDEX IF NOT EXISTS idx_registration_requests_reviewed_by 
ON registration_requests(reviewed_by);

-- Add index for user_roles.organization_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id 
ON user_roles(organization_id);

-- Add index for user_roles.role_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id 
ON user_roles(role_id);