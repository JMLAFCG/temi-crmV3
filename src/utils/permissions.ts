import { UserRole } from '../types';

// Définition des permissions par rôle
export const ROLE_PERMISSIONS = {
  client: [
    'view_own_profile',
    'update_own_profile',
    'view_own_projects',
    'create_own_projects',
    'upload_own_documents',
    'view_own_quotes',
    'submit_contact_request',
    'sign_documents',
    'view_own_journal',
  ],

  entreprise_partenaire: [
    'view_own_profile',
    'update_own_profile',
    'view_assigned_projects',
    'update_assigned_projects',
    'submit_quotes',
    'view_own_quotes',
    'upload_project_documents',
    'view_project_documents',
    'communicate_with_clients',
    'view_own_statistics',
    'view_own_invoices',
    'update_company_info',
    'manage_company_documents',
    'view_territory_projects',
    'accept_missions',
    'refuse_missions',
    'upload_legal_documents',
    'view_own_payments',
  ],

  apporteur: [
    'view_own_profile',
    'update_own_profile',
    'create_apports',
    'view_own_apports',
    'update_own_apports',
    'view_own_commissions',
  ],

  mandatary: [
    'view_own_profile',
    'update_own_profile',
    'create_projects',
    'view_portfolio_projects',
    'update_portfolio_projects',
    'view_portfolio_clients',
    'create_portfolio_clients',
    'update_portfolio_clients',
    'upload_client_documents',
    'validate_client_documents',
    'assign_contractors',
    'view_own_statistics',
    'view_own_commissions',
    'view_verified_companies',
    'submit_user_modifications',
    'view_user_details',
    'view_user_dashboards',
  ],

  commercial: [
    'view_own_profile',
    'update_own_profile',
    'create_projects',
    'view_portfolio_projects',
    'update_portfolio_projects',
    'view_portfolio_clients',
    'create_portfolio_clients',
    'update_portfolio_clients',
    'upload_client_documents',
    'validate_client_documents',
    'assign_contractors',
    'view_own_statistics',
    'view_own_commissions',
    'view_verified_companies',
    'submit_user_modifications',
    'manage_ai_proposals',
    'negotiate_with_companies',
    'validate_ai_analysis',
    'view_user_details',
    'view_user_dashboards',
  ],

  manager: [
    'view_all_profiles',
    'create_users',
    'update_users',
    'deactivate_users',
    'validate_client_documents',
    'validate_companies',
    'view_all_statistics',
    'manage_reminders',
    'reset_passwords',
    'view_all_projects',
    'view_all_clients',
    'view_all_companies',
    'view_all_commissions',
    'manage_missions',
    'manage_payments',
    'manage_ai_proposals',
    'negotiate_with_companies',
    'validate_ai_analysis',
    'override_ai_decisions',
    'view_user_details',
    'view_user_dashboards',
  ],

  admin: [
    'view_all_profiles',
    'create_users',
    'update_users',
    'deactivate_users',
    'validate_client_documents',
    'validate_companies',
    'view_all_statistics',
    'manage_reminders',
    'reset_passwords',
    'view_all_projects',
    'view_all_clients',
    'view_all_companies',
    'view_all_commissions',
    'manage_missions',
    'manage_payments',
    'manage_document_templates',
    'global_configuration',
    'export_data',
    'manage_teams',
    'manage_ai_proposals',
    'negotiate_with_companies',
    'validate_ai_analysis',
    'override_ai_decisions',
    'configure_ai_settings',
    'view_user_details',
    'view_user_dashboards',
  ],

  super_admin: [
    'full_access',
    'view_logs',
    'manage_security',
    'manage_api_keys',
    'audit_actions',
    'delete_data',
    'migrate_roles',
  ],
};

// Fonction pour vérifier si un utilisateur a une permission
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('full_access');
};

// Fonction pour vérifier l'accès à une route
export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const routePermissions: Record<string, string[]> = {
    '/dashboard': ['view_own_profile', 'view_all_profiles'],
    '/dashboard-client': ['view_own_profile'],
    '/dashboard-entreprise': ['view_assigned_projects'],
    '/dashboard-apporteur': ['view_own_apports'],
    '/projects': ['view_own_projects', 'view_portfolio_projects', 'view_all_projects'],
    '/projects/create': ['create_projects'],
    '/clients': ['view_portfolio_clients', 'view_all_clients'],
    '/clients/create': ['create_portfolio_clients'],
    '/companies': ['view_verified_companies', 'view_all_companies'],
    '/companies/create': ['validate_companies'],
    '/providers': ['view_all_profiles'],
    '/documents': ['upload_own_documents', 'upload_client_documents', 'view_all_profiles'],
    '/calendar': ['view_own_profile', 'view_portfolio_projects', 'view_all_profiles'],
    '/messages': ['view_own_profile', 'view_portfolio_projects', 'view_all_profiles'],
    '/commissions': ['view_own_commissions', 'view_all_commissions'],
    '/analytics': ['view_own_statistics', 'view_all_statistics'],
    '/settings': ['global_configuration', 'view_all_profiles'],
    '/admin/ai-management': ['manage_ai_proposals', 'validate_ai_analysis'],
  };

  const requiredPermissions = routePermissions[route] || [];
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

// Fonction pour filtrer les données selon le rôle
export const filterDataByRole = (
  userRole: UserRole,
  userId: string,
  data: any[],
  dataType: 'projects' | 'clients' | 'companies'
) => {
  if (hasPermission(userRole, 'view_all_' + dataType)) {
    return data;
  }

  switch (dataType) {
    case 'projects':
      if (userRole === 'client') {
        return data.filter(item => item.client_id === userId);
      }
      if (userRole === 'mandatary' || userRole === 'commercial') {
        return data.filter(item => item.agent_id === userId);
      }
      if (userRole === 'apporteur') {
        return data.filter(item => item.business_provider_id === userId);
      }
      if (userRole === 'entreprise_partenaire') {
        return data.filter(
          item => item.assigned_companies && item.assigned_companies.includes(userId)
        );
      }
      break;

    case 'clients':
      if (userRole === 'mandatary' || userRole === 'commercial') {
        return data.filter(item => item.managed_by === userId);
      }
      if (userRole === 'entreprise_partenaire') {
        return data.filter(
          item =>
            item.projects &&
            item.projects.some(
              (p: any) => p.assigned_companies && p.assigned_companies.includes(userId)
            )
        );
      }
      break;

    case 'companies':
      if (userRole === 'mandatary' || userRole === 'commercial') {
        return data.filter(item => item.verification_status === 'verified');
      }
      if (userRole === 'entreprise_partenaire') {
        return data.filter(item => item.id === userId);
      }
      break;
  }

  return [];
};

// Hook pour vérifier les permissions dans les composants
export const usePermissions = (userRole: UserRole) => {
  return {
    can: (permission: string) => hasPermission(userRole, permission),
    canAccess: (route: string) => canAccessRoute(userRole, route),
    filter: (data: any[], dataType: 'projects' | 'clients' | 'companies', userId: string) =>
      filterDataByRole(userRole, userId, data, dataType),
  };
};

// Fonction pour obtenir les rôles visibles selon le rôle de l'utilisateur
export const getVisibleRoles = (userRole: UserRole): UserRole[] => {
  switch (userRole) {
    case 'super_admin':
      return [
        'client',
        'entreprise_partenaire',
        'apporteur',
        'mandatary',
        'commercial',
        'manager',
        'admin',
      ];
    case 'admin':
      return ['client', 'entreprise_partenaire', 'apporteur', 'mandatary', 'commercial', 'manager'];
    case 'manager':
      return ['client', 'entreprise_partenaire', 'apporteur', 'mandatary', 'commercial'];
    case 'mandatary':
    case 'commercial':
      return ['client'];
    default:
      return [];
  }
};

// Fonction pour vérifier si un rôle peut en créer/modifier un autre
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  const visibleRoles = getVisibleRoles(managerRole);
  return visibleRoles.includes(targetRole);
};
