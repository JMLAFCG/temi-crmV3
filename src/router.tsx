import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import NotFound from './ui/NotFound';
import ErrorBoundary from './ui/ErrorBoundary';
import Guard from './utils/routeGuard';
import { paths } from './routes/paths';

const Suspense = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>}>{children}</React.Suspense>
);

const lazyDefault = (factory: () => Promise<any>, modulePath: string) =>
  React.lazy(async () => {
    const mod = await factory();
    if (!mod?.default) {
      throw new Error(`Page importée sans export default: ${modulePath}`);
    }
    return { default: mod.default };
  });

// Import des pages avec les bons chemins
const Dashboard = lazyDefault(
  () => import('./pages/dashboard/DashboardPage'),
  'src/pages/dashboard/DashboardPage.tsx'
);
const ClientsPage = lazyDefault(
  () => import('./pages/clients/ClientListPage'),
  'src/pages/clients/ClientListPage.tsx'
);
const CreateClientPage = lazyDefault(
  () => import('./pages/clients/CreateClientPage'),
  'src/pages/clients/CreateClientPage.tsx'
);
const ClientDetailsPage = lazyDefault(
  () => import('./pages/clients/ClientDetailsPage'),
  'src/pages/clients/ClientDetailsPage.tsx'
);
const CompaniesPage = lazyDefault(
  () => import('./pages/companies/CompaniesPage'),
  'src/pages/companies/CompaniesPage.tsx'
);
const CreateCompanyPage = lazyDefault(
  () => import('./pages/companies/CreateCompanyPage'),
  'src/pages/companies/CreateCompanyPage.tsx'
);
const CompanyDetailsPage = lazyDefault(
  () => import('./pages/companies/CompanyDetailsPage'),
  'src/pages/companies/CompanyDetailsPage.tsx'
);
const ProjectsPage = lazyDefault(
  () => import('./pages/projects/ProjectsPage'),
  'src/pages/projects/ProjectsPage.tsx'
);
const CreateProjectPage = lazyDefault(
  () => import('./pages/projects/CreateProjectPage'),
  'src/pages/projects/CreateProjectPage.tsx'
);
const BusinessProviderPage = lazyDefault(
  () => import('./pages/providers/BusinessProviderPage'),
  'src/pages/providers/BusinessProviderPage.tsx'
);
const CreateBusinessProviderPage = lazyDefault(
  () => import('./pages/providers/CreateBusinessProviderPage'),
  'src/pages/providers/CreateBusinessProviderPage.tsx'
);
const BusinessProviderDetailsPage = lazyDefault(
  () => import('./pages/providers/BusinessProviderDetailsPage'),
  'src/pages/providers/BusinessProviderDetailsPage.tsx'
);
const DocumentsPage = lazyDefault(
  () => import('./pages/documents/DocumentsPage'),
  'src/pages/documents/DocumentsPage.tsx'
);
const CalendarPage = lazyDefault(
  () => import('./pages/calendar/CalendarPage'),
  'src/pages/calendar/CalendarPage.tsx'
);
const MessagesPage = lazyDefault(
  () => import('./pages/messages/MessagesPage'),
  'src/pages/messages/MessagesPage.tsx'
);
const CommissionsPage = lazyDefault(
  () => import('./pages/commissions/CommissionsPage'),
  'src/pages/commissions/CommissionsPage.tsx'
);
const MandataryCommissionsPage = lazyDefault(
  () => import('./pages/commissions/MandataryCommissionsPage'),
  'src/pages/commissions/MandataryCommissionsPage.tsx'
);
const InvoicingPage = lazyDefault(
  () => import('./pages/invoicing/InvoicingPage'),
  'src/pages/invoicing/InvoicingPage.tsx'
);
const AuditPage = lazyDefault(
  () => import('./pages/audit/AuditPage'),
  'src/pages/audit/AuditPage.tsx'
);
const AIManagementPage = lazyDefault(
  () => import('./pages/admin/AIManagementPage'),
  'src/pages/admin/AIManagementPage.tsx'
);
const GuideApplicationPage = lazyDefault(
  () => import('./pages/admin/GuideApplicationPage'),
  'src/pages/admin/GuideApplicationPage.tsx'
);
const APIDocumentationPage = lazyDefault(
  () => import('./pages/api/APIDocumentationPage'),
  'src/pages/api/APIDocumentationPage.tsx'
);
const SettingsLayout = lazyDefault(
  () => import('./pages/settings/SettingsLayout'),
  'src/pages/settings/SettingsLayout.tsx'
);
const GeneralSettingsPage = lazyDefault(
  () => import('./pages/settings/GeneralSettingsPage'),
  'src/pages/settings/GeneralSettingsPage.tsx'
);
const UserSettingsPage = lazyDefault(
  () => import('./pages/settings/UserSettingsPage'),
  'src/pages/settings/UserSettingsPage.tsx'
);
const RoleSettingsPage = lazyDefault(
  () => import('./pages/settings/RoleSettingsPage'),
  'src/pages/settings/RoleSettingsPage.tsx'
);
const BillingSettingsPage = lazyDefault(
  () => import('./pages/settings/BillingSettingsPage'),
  'src/pages/settings/BillingSettingsPage.tsx'
);
const IntegrationSettingsPage = lazyDefault(
  () => import('./pages/settings/IntegrationSettingsPage'),
  'src/pages/settings/IntegrationSettingsPage.tsx'
);
const UserDetailsPage = lazyDefault(
  () => import('./pages/users/UserDetailsPage'),
  'src/pages/users/UserDetailsPage.tsx'
);
const UserDashboardViewer = lazyDefault(
  () => import('./components/users/UserDashboardViewer'),
  'src/components/users/UserDashboardViewer.tsx'
);
const LoginPage = lazyDefault(
  () => import('./pages/auth/LoginPage'),
  'src/pages/auth/LoginPage.tsx'
);
const RegisterPage = lazyDefault(
  () => import('./pages/auth/RegisterPage'),
  'src/pages/auth/RegisterPage.tsx'
);
const ResetPasswordPage = lazyDefault(
  () => import('./pages/auth/ResetPasswordPage'),
  'src/pages/auth/ResetPasswordPage.tsx'
);
const HomePage = lazyDefault(
  () => import('./pages/HomePage'),
  'src/pages/HomePage.tsx'
);

const mainRoutes = createBrowserRouter([
  // Page d'accueil publique
  {
    path: paths.home,
    element: (
      <Suspense>
        <HomePage />
      </Suspense>
    ),
  },
  // Routes d'authentification
  {
    path: paths.login,
    element: (
      <Suspense>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: paths.register,
    element: (
      <Suspense>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: paths.resetPassword,
    element: (
      <Suspense>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  // Routes protégées avec AppLayout
  {
    element: <AppLayout />,
    errorElement: (
      <ErrorBoundary>
        <NotFound />
      </ErrorBoundary>
    ),
    children: [
      {
        path: paths.dashboard,
        element: (
          <Guard>
            <Suspense>
              <Dashboard />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.dashboardClient,
        element: (
          <Guard roles={['client', 'admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <Dashboard />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.dashboardEntreprise,
        element: (
          <Guard roles={['partner_company', 'admin', 'manager']}>
            <Suspense>
              <Dashboard />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.dashboardApporteur,
        element: (
          <Guard roles={['business_provider', 'admin', 'manager']}>
            <Suspense>
              <Dashboard />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.clients,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <ClientsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.clientsCreate,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <CreateClientPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.clientDetails,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <ClientDetailsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.companies,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <CompaniesPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.companiesCreate,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <CreateCompanyPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.companyDetails,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <CompanyDetailsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.projects,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary', 'client']}>
            <Suspense>
              <ProjectsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.projectsCreate,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <CreateProjectPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.providers,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <BusinessProviderPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.providersCreate,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <CreateBusinessProviderPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.providerDetails,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <BusinessProviderDetailsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.documents,
        element: (
          <Guard
            roles={['admin', 'manager', 'commercial', 'mandatary', 'client', 'partner_company']}
          >
            <Suspense>
              <DocumentsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.calendar,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <CalendarPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.messages,
        element: (
          <Guard
            roles={['admin', 'manager', 'commercial', 'mandatary', 'client', 'partner_company']}
          >
            <Suspense>
              <MessagesPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.commissions,
        element: (
          <Guard roles={['admin', 'manager', 'business_provider']}>
            <Suspense>
              <CommissionsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.commissionsMandataries,
        element: (
          <Guard roles={['admin', 'manager', 'mandatary']}>
            <Suspense>
              <MandataryCommissionsPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.invoicing,
        element: (
          <Guard roles={['admin', 'manager', 'comptable']}>
            <Suspense>
              <InvoicingPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.audit,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <AuditPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.aiManagement,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <Suspense>
              <AIManagementPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.adminGuide,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <GuideApplicationPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.apiDocumentation,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <APIDocumentationPage />
            </Suspense>
          </Guard>
        ),
      },
      {
        path: paths.settings,
        element: (
          <Guard roles={['admin', 'manager']}>
            <Suspense>
              <SettingsLayout />
            </Suspense>
          </Guard>
        ),
        children: [
          { index: true, element: <Navigate to={paths.settingsGeneral} replace /> },
          {
            path: 'general',
            element: (
              <Suspense>
                <GeneralSettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense>
                <UserSettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'users/:id',
            element: (
              <Suspense>
                <UserDetailsPage />
              </Suspense>
            ),
          },
          {
            path: 'roles',
            element: (
              <Suspense>
                <RoleSettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'billing',
            element: (
              <Suspense>
                <BillingSettingsPage />
              </Suspense>
            ),
          },
          {
            path: 'integrations',
            element: (
              <Suspense>
                <IntegrationSettingsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: paths.userDashboard,
        element: (
          <Suspense>
            <UserDashboardViewer />
          </Suspense>
        ),
      },
    ],
  },
  // Routes 404 - en dehors du layout
  {
    path: paths.notFound,
    element: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default mainRoutes;