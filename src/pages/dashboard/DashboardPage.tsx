import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Euro,
  FileText,
  Search,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useClientStore } from '../../store/clientStore';
import { useCommissionStore } from '../../store/commissionStore';
import ClientDashboard from './ClientDashboard';
import EntrepriseDashboard from './EntrepriseDashboard';
import ApporteurDashboard from './ApporteurDashboard';
import { buildPath, paths } from '../../routes/paths';
import type { Project } from '../../types';

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
});

const statusLabel: Record<Project['status'], string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const statusClass: Record<Project['status'], string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const getProgress = (project: Project) => {
  if (project.status === 'completed') return 100;
  if (project.status === 'cancelled') return 0;
  if (project.status === 'draft') return 15;
  if (project.status === 'pending') return 35;
  return 65;
};

const getClientName = (project: Project) => {
  const client = project.client;
  if (!client) return 'Client non renseigné';
  return `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || 'Client';
};

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  if (user) {
    const role = String(user.role);
    if (role === 'client') return <ClientDashboard />;
    if (role === 'entreprise_partenaire' || role === 'partner_company') return <EntrepriseDashboard />;
    if (role === 'apporteur' || role === 'business_provider') return <ApporteurDashboard />;
  }

  const { projects, fetchProjects, loading: projectsLoading, error: projectsError } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const { commissions, fetchCommissions } = useCommissionStore();

  useEffect(() => {
    void Promise.all([fetchProjects(), fetchClients(), fetchCommissions()]);
  }, [fetchProjects, fetchClients, fetchCommissions]);

  const metrics = useMemo(() => {
    const activeProjects = projects.filter(project => ['pending', 'in_progress'].includes(project.status));
    const urgentProjects = activeProjects.filter(project => {
      const endDate = project.timeline?.endDate;
      if (!endDate) return false;
      const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
      return days <= 7;
    });
    const pendingProjects = projects.filter(project => project.status === 'pending');
    const potential = activeProjects.reduce((sum, project) => sum + (project.budget?.total || 0), 0);
    const pendingCommissions = commissions
      .filter((commission: any) => ['pending', 'en_attente'].includes(String(commission.status || commission.statut)))
      .reduce((sum: number, commission: any) => sum + Number(commission.commission_amount || commission.montant || 0), 0);

    return {
      activeProjects: activeProjects.length,
      urgentProjects: urgentProjects.length,
      pendingProjects: pendingProjects.length,
      potential,
      pendingCommissions,
      activeClients: clients.length,
    };
  }, [clients.length, commissions, projects]);

  const priorityProjects = useMemo(() => {
    return [...projects]
      .filter(project => project.status !== 'completed' && project.status !== 'cancelled')
      .sort((a, b) => {
        const statusWeight = (project: Project) => (project.status === 'pending' ? 0 : project.status === 'in_progress' ? 1 : 2);
        const statusDifference = statusWeight(a) - statusWeight(b);
        if (statusDifference !== 0) return statusDifference;
        return Number(b.budget?.total || 0) - Number(a.budget?.total || 0);
      })
      .slice(0, 8);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return priorityProjects;
    return projects
      .filter(project =>
        [project.title, project.location?.city, getClientName(project)]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [priorityProjects, projects, search]);

  const loading = projectsLoading && projects.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Pilotage opérationnel</p>
          <h1 className="text-3xl font-bold text-gray-950">Bonjour {user?.firstName || 'Jean-Marc'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(paths.clientsCreate)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Nouveau client
          </button>
          <button
            type="button"
            onClick={() => navigate(paths.projectsCreate)}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Nouveau dossier
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'Urgences', value: metrics.urgentProjects, icon: AlertTriangle, route: paths.projectsPending },
          { label: 'Dossiers actifs', value: metrics.activeProjects, icon: BriefcaseBusiness, route: paths.projectsActive },
          { label: 'En attente', value: metrics.pendingProjects, icon: Clock3, route: paths.projectsPending },
          { label: 'Clients', value: metrics.activeClients, icon: Users, route: paths.clients },
          { label: 'Potentiel actif', value: currency.format(metrics.potential), icon: Euro, route: paths.projects },
        ].map(metric => (
          <button
            key={metric.label}
            type="button"
            onClick={() => navigate(metric.route)}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-primary-300 hover:shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <metric.icon size={19} className="text-gray-500" />
              <ArrowRight size={16} className="text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-950">{metric.value}</div>
            <div className="mt-1 text-sm text-gray-500">{metric.label}</div>
          </button>
        ))}
      </section>

      {metrics.pendingCommissions > 0 && (
        <button
          type="button"
          onClick={() => navigate(paths.commissions)}
          className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left"
        >
          <span>
            <span className="block text-sm font-medium text-amber-800">Commissions en attente</span>
            <span className="text-xl font-bold text-amber-950">{currency.format(metrics.pendingCommissions)}</span>
          </span>
          <ArrowRight className="text-amber-700" />
        </button>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Dossiers à traiter</h2>
              <p className="text-sm text-gray-500">Les dossiers en attente apparaissent en premier.</p>
            </div>
            <label className="relative block w-full md:max-w-sm">
              <span className="sr-only">Rechercher un dossier</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Client, dossier ou ville"
                className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </label>
          </div>
        </div>

        {projectsError && (
          <div className="m-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">{projectsError}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des dossiers…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={30} />
            <p className="font-semibold text-gray-900">Aucun dossier à afficher</p>
            <p className="mt-1 text-sm text-gray-500">Crée un dossier ou modifie ta recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Client et dossier</th>
                  <th className="px-4 py-3">Situation</th>
                  <th className="px-4 py-3">Avancement</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3 text-right">Potentiel</th>
                  <th className="px-4 py-3" aria-label="Action" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map(project => {
                  const progress = getProgress(project);
                  const endDate = project.timeline?.endDate;
                  return (
                    <tr
                      key={project.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(buildPath('projectDetails', { id: project.id }))}
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-950">{project.title || 'Dossier sans titre'}</div>
                        <div className="mt-1 text-sm text-gray-500">{getClientName(project)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[project.status]}`}>
                          {statusLabel[project.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {endDate ? dateFormatter.format(new Date(endDate)) : 'Non définie'}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-950">
                        {currency.format(project.budget?.total || 0)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ArrowRight size={18} className="inline text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate(paths.documents)}
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left hover:border-primary-300"
        >
          <span className="flex items-center gap-3">
            <FileText className="text-gray-500" size={20} />
            <span>
              <span className="block font-semibold text-gray-950">Documents</span>
              <span className="text-sm text-gray-500">Contrôler les pièces</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => navigate(paths.calendar)}
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left hover:border-primary-300"
        >
          <span className="flex items-center gap-3">
            <Clock3 className="text-gray-500" size={20} />
            <span>
              <span className="block font-semibold text-gray-950">Agenda</span>
              <span className="text-sm text-gray-500">Voir les prochaines échéances</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => navigate(paths.clients)}
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left hover:border-primary-300"
        >
          <span className="flex items-center gap-3">
            <Users className="text-gray-500" size={20} />
            <span>
              <span className="block font-semibold text-gray-950">Clients</span>
              <span className="text-sm text-gray-500">Accéder aux synthèses</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-400" />
        </button>
      </section>
    </div>
  );
};

export default DashboardPage;
