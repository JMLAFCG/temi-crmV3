// src/router.tsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import NotFound from './ui/NotFound';
import ErrorBoundary from './ui/ErrorBoundary';
import Guard from './utils/routeGuard';
import { paths } from './routes/paths';

/** Wrapper Suspense unique */
const AppSuspense = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    }
  >
    {children}
  </React.Suspense>
);

/** Lazy helper typé pour le typecheck CI */
const lazyDefault = <T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>,
  modulePath: string
) =>
  React.lazy(async () => {
    const mod = await factory();
    if (!mod?.default) {
      throw new Error(`Page importée sans export default: ${modulePath}`);
    }
    return { default: mod.default };
  });

// ---------- Imports paresseux ----------
const Dashboard = lazyDefault(() => import('./pages/dashboard/DashboardPage'), 'src/pages/dashboard/DashboardPage.tsx');

const ClientsPage = lazyDefault(() => import('./pages/clients/ClientListPage'), 'src/pages/clients/ClientListPage.tsx');
const CreateClientPage = lazyDefault(() => import('./pages/clients/CreateClientPage'), 'src/pages/clients/CreateClientPage.tsx');
const ClientDetailsPage = lazyDefault(() => import('./pages/clients/ClientDetailsPage'), 'src/pages/clients/ClientDetailsPage.tsx');

const CompaniesPage = lazyDefault(() => import('./pages/companies/CompaniesPage'), 'src/pages/companies/CompaniesPage.tsx');
const CreateCompanyPage = lazyDefault(() => import('./pages/companies/CreateCompanyPage'), 'src/pages/companies/CreateCompanyPage.tsx');
const CompanyDetailsPage = lazyDefault(() => import('./pages/companies/CompanyDetailsPage'), 'src/pages/companies/CompanyDetailsPage.tsx');

const ProjectsPage = lazyDefault(() => import('./pages/projects/ProjectsPage'), 'src/pages/projects/ProjectsPage.tsx');
const CreateProjectPage = lazyDefault(() => import('./pages/projects/CreateProjectPage'), 'src/pages/projects/CreateProjectPage.tsx');

const BusinessProviderPage = lazyDefault(() => import('./pages/providers/BusinessProviderPage'), 'src/pages/providers/BusinessProviderPage.tsx');
const CreateBusinessProviderPage = lazyDefault(() => import('./pages/providers/CreateBusinessProviderPage'), 'src/pages/providers/CreateBusinessProviderPage.tsx');
const BusinessProviderDetailsPage = lazyDefault(() => import('./pages/providers/BusinessProviderDetailsPage'), 'src/pages/providers/BusinessProviderDetailsPage.tsx');

const DocumentsPage = lazyDefault(() => import('./pages/documents/DocumentsPage'), 'src/pages/documents/DocumentsPage.tsx');
const CalendarPage = lazyDefault(() => import('./pages/calendar/CalendarPage'), 'src/pages/calendar/CalendarPage.tsx');
const MessagesPage = lazyDefault(() => import('./pages/messages/MessagesPage'), 'src/pages/messages/MessagesPage.tsx');

const CommissionsPage = lazyDefault(() => import('./pages/commissions/CommissionsPage'), 'src/pages/commissions/CommissionsPage.tsx');
const MandataryCommissionsPage = lazyDefault(() => import('./pages/commissions/MandataryCommissionsPage'), 'src/pages/commissions/MandataryCommissionsPage.tsx');

const InvoicingPage = lazyDefault(() => import('./pages/invoicing/InvoicingPage'), 'src/pages/invoicing/InvoicingPage.tsx');
const AuditPage = lazyDefault(() => import('./pages/audit/AuditPage'), 'src/pages/audit/AuditPage.tsx');
const BulkImportPage = lazyDefault(() => import('./pages/import/BulkImportPage'), 'src/pages/import/BulkImportPage.tsx');

const AIManagementPage = lazyDefault(() => import('./pages/admin/AIManagementPage'), 'src/pages/admin/AIManagementPage.tsx');
const GuideApplicationPage = lazyDefault(() => import('./pages/admin/GuideApplicationPage'), 'src/pages/admin/GuideApplicationPage.tsx');
const APIDocumentationPage = lazyDefault(() => import('./pages/api/APIDocumentationPage'), 'src/pages/api/APIDocumentationPage.tsx');
const RegistrationRequestsPage = lazyDefault(() => import('./pages/admin/RegistrationRequestsPage'), 'src/pages/admin/RegistrationRequestsPage.tsx');

const SettingsLayout = lazyDefault(() => import('./pages/settings/SettingsLayout'), 'src/pages/settings/SettingsLayout.tsx');
const GeneralSettingsPage = lazyDefault(() => import('./pages/settings/GeneralSettingsPage'), 'src/pages/settings/GeneralSettingsPage.tsx');
const UserSettingsPage = lazyDefault(() => import('./pages/settings/UserSettingsPage'), 'src/pages/settings/UserSettingsPage.tsx');
const RoleSettingsPage = lazyDefault(() => import('./pages/settings/RoleSettingsPage'), 'src/pages/settings/RoleSettingsPage.tsx');
const BillingSettingsPage = lazyDefault(() => import('./pages/settings/BillingSettingsPage'), 'src/pages/settings/BillingSettingsPage.tsx');
const IntegrationSettingsPage = lazyDefault(() => import('./pages/settings/IntegrationSettingsPage'), 'src/pages/settings/IntegrationSettingsPage.tsx');

const UserDetailsPage = lazyDefault(() => import('./pages/users/UserDetailsPage'), 'src/pages/users/UserDetailsPage.tsx');
const UserDashboardViewer = lazyDefault(() => import('./components/users/UserDashboardViewer'), 'src/components/users/UserDashboardViewer.tsx');

const LoginPage = lazyDefault(() => import('./pages/auth/LoginPage'), 'src/pages/auth/LoginPage.tsx');
const RegisterPage = lazyDefault(() => import('./pages/auth/RegisterPage'), 'src/pages/auth/RegisterPage.tsx');
const JoinNetworkPage = lazyDefault(() => import('./pages/auth/JoinNetworkPage'), 'src/pages/auth/JoinNetworkPage.tsx');
const ResetPasswordPage = lazyDefault(() => import('./pages/auth/ResetPasswordPage'), 'src/pages/auth/ResetPasswordPage.tsx');

const HomePage = lazyDefault(() => import('./pages/HomePage'), 'src/pages/HomePage.tsx');

// ---------- Router ----------
const mainRoutes = createBrowserRouter([
  // Public
  { path: paths.home, element: <AppSuspense><HomePage /></AppSuspense> },

  // Auth
  { path: paths.login, element: <AppSuspense><LoginPage /></AppSuspense> },
  { path: paths.register, element: <AppSuspense><RegisterPage /></AppSuspense> },
  { path: paths.joinNetwork, element: <AppSuspense><JoinNetworkPage /></AppSuspense> },
  { path: paths.resetPassword, element: <AppSuspense><ResetPasswordPage /></AppSuspense> },

  // Protégé par AppLayout
  {
    element: <AppLayout />,
    errorElement: (
      <ErrorBoundary>
        <NotFound />
      </ErrorBoundary>
    ),
    children: [
      // Dashboards
      { path: paths.dashboard, element: <Guard><AppSuspense><Dashboard /></AppSuspense></Guard> },
      {
        path: paths.dashboardClient,
        element: (
          <Guard roles={['client', 'admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><Dashboard /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.dashboardEntreprise,
        element: (
          <Guard roles={['partner_company', 'admin', 'manager']}>
            <AppSuspense><Dashboard /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.dashboardApporteur,
        element: (
          <Guard roles={['business_provider', 'admin', 'manager']}>
            <AppSuspense><Dashboard /></AppSuspense>
          </Guard>
        ),
      },

      // Clients
      {
        path: paths.clients,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><ClientsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.clientsCreate,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CreateClientPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.clientDetails,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><ClientDetailsPage /></AppSuspense>
          </Guard>
        ),
      },

      // Entreprises
      {
        path: paths.companies,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CompaniesPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.companiesPartners,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CompaniesPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.companiesProviders,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><CompaniesPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.companiesCreate,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CreateCompanyPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.companyDetails,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CompanyDetailsPage /></AppSuspense>
          </Guard>
        ),
      },

      // Projets
      {
        path: paths.projects,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary', 'client']}>
            <AppSuspense><ProjectsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.projectsActive,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><ProjectsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.projectsPending,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><ProjectsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.projectsCompleted,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><ProjectsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.projectsCreate,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CreateProjectPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.projectDetails,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary', 'client']}>
            <AppSuspense><ProjectsPage /></AppSuspense>
          </Guard>
        ),
      },

      // Apporteurs
      {
        path: paths.providers,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><BusinessProviderPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.providersCreate,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><CreateBusinessProviderPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.providerDetails,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><BusinessProviderDetailsPage /></AppSuspense>
          </Guard>
        ),
      },

      // Divers
      {
        path: paths.documents,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary', 'client', 'partner_company']}>
            <AppSuspense><DocumentsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.calendar,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><CalendarPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.messages,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary', 'client', 'partner_company']}>
            <AppSuspense><MessagesPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.commissions,
        element: (
          <Guard roles={['admin', 'manager', 'business_provider']}>
            <AppSuspense><CommissionsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.commissionsMandataries,
        element: (
          <Guard roles={['admin', 'manager', 'mandatary']}>
            <AppSuspense><MandataryCommissionsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.bulkImport,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><BulkImportPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.invoicing,
        element: (
          <Guard roles={['admin', 'manager', 'comptable']}>
            <AppSuspense><InvoicingPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.audit,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><AuditPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.adminRegistrationRequests,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><RegistrationRequestsPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.aiManagement,
        element: (
          <Guard roles={['admin', 'manager', 'commercial', 'mandatary']}>
            <AppSuspense><AIManagementPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.adminGuide,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><GuideApplicationPage /></AppSuspense>
          </Guard>
        ),
      },
      {
        path: paths.apiDocumentation,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><APIDocumentationPage /></AppSuspense>
          </Guard>
        ),
      },

      // Settings (enfants)
      {
        path: paths.settings,
        element: (
          <Guard roles={['admin', 'manager']}>
            <AppSuspense><SettingsLayout /></AppSuspense>
          </Guard>
        ),
        children: [
          { index: true, element: <Navigate to={paths.settingsGeneral} replace /> },
          { path: 'general', element: <AppSuspense><GeneralSettingsPage /></AppSuspense> },
          { path: 'users', element: <AppSuspense><UserSettingsPage /></AppSuspense> },
          { path: 'users/:id', element: <AppSuspense><UserDetailsPage /></AppSuspense> },
          { path: 'roles', element: <AppSuspense><RoleSettingsPage /></AppSuspense> },
          { path: 'billing', element: <AppSuspense><BillingSettingsPage /></AppSuspense> },
          { path: 'integrations', element: <AppSuspense><IntegrationSettingsPage /></AppSuspense> },
        ],
      },

      // Dashboard utilisateur
      { path: paths.userDashboard, element: <AppSuspense><UserDashboardViewer /></AppSuspense> },
    ],
  },

  // 404
  { path: paths.notFound, element: <NotFound /> },
  { path: '*', element: <NotFound /> },
]);

export default mainRoutes;
