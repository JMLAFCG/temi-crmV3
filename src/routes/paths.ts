export const paths = {
  home: '/',
  dashboard: '/dashboard',
  dashboardClient: '/dashboard-client',
  dashboardEntreprise: '/dashboard-entreprise',
  dashboardApporteur: '/dashboard-apporteur',

  // Projets
  projects: '/projects',
  projectsCreate: '/projects/create',
  projectDetails: '/projects/:id',
  projectsActive: '/projects/active',
  projectsPending: '/projects/pending',
  projectsCompleted: '/projects/completed',

  // Clients
  clients: '/clients',
  clientsCreate: '/clients/create',
  clientDetails: '/clients/:id',

  // Entreprises
  companies: '/companies',
  companiesCreate: '/companies/create',
  companyDetails: '/companies/:id',
  companiesPartners: '/companies/partners',
  companiesProviders: '/companies/providers',

  // Apporteurs
  providers: '/providers',
  providersCreate: '/providers/create',
  providerDetails: '/providers/:id',

  // Documents et communication
  documents: '/documents',
  calendar: '/calendar',
  messages: '/messages',

  // Commissions
  commissions: '/commissions',
  commissionsMandataries: '/commissions/mandataries',
  
  // Facturation
  invoicing: '/invoicing',
  
  // Audit
  audit: '/audit',

  // Analytics
  analytics: '/analytics',

  // IA
  aiManagement: '/admin/ai-management',
  adminGuide: '/admin/guide',
  apiDocumentation: '/admin/api-docs',

  // Administration
  admin: '/admin',
  settings: '/settings',
  settingsGeneral: '/settings/general',
  settingsUsers: '/settings/users',
  settingsUserDetails: '/settings/users/:id',
  settingsUserEdit: '/settings/users/:id/edit',
  settingsRoles: '/settings/roles',
  settingsBilling: '/settings/billing',
  settingsIntegrations: '/settings/integrations',
  settingsValidation: '/settings/validation',

  // Utilisateurs
  userDetails: '/users/:id',
  userDashboard: '/users/:id/dashboard',

  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',

  // Erreurs
  notFound: '/404',
} as const;

export type RouteKey = keyof typeof paths;
export const allPaths: string[] = Object.values(paths);

// Helper pour construire des URLs avec paramètres
export const buildPath = (route: RouteKey, params?: Record<string, string | number>): string => {
  let path = paths[route];
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, String(value));
    });
  }
  return path;
};

// Type guard pour vérifier si une chaîne est une clé de route valide
export const isRouteKey = (x: string): x is RouteKey => {
  return x in paths;
};

// Alias pour compatibilité avec le code existant
export const routes = paths;