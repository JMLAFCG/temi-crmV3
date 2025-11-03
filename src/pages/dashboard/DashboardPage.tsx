// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Building,
  FileText,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Euro,
  AlertTriangle,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';

// 🔌 Supabase (client Vite déjà présent chez toi)
import { supabase, getCurrentUser } from '../../lib/supabase';

// === Stat cards ===
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
  gradient: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, positive, gradient }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient}`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
          {change && (
            <div
              className={`flex items-center text-sm font-medium ${
                positive ? 'text-green-200' : 'text-red-200'
              }`}
            >
              <TrendingUp size={16} className="mr-1" />
              {change}
            </div>
          )}
        </div>
        <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
    </div>
  );
};

// === Project cards ===
interface ProjectCardProps {
  title: string;
  client: string;
  budget: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
}
const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  client,
  budget,
  progress,
  status,
  priority,
}) => {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  } as const;

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  } as const;

  const statusLabels = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  } as const;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-1 h-12 rounded-full ${priorityColors[priority]}`} />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
            <p className="text-gray-600">Client: {client}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      <p className="text-gray-700 mb-4 font-medium">Budget: {budget}</p>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progression</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// === Activity items ===
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}
const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, description, time, type }) => {
  const typeColors = {
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
  } as const;

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className={`p-2 rounded-xl ${typeColors[type]}`}>{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="text-gray-500 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};

// === Page ===
const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Rôles (calculés avant les hooks)
  const isClient = String(user?.role) === 'client';
  const isApporteur = String(user?.role) === 'apporteur';
  const isMandatary = String(user?.role) === 'mandatary';

  // === TOUS LES HOOKS APPELÉS INCONDITIONNELLEMENT ===
  const [counts, setCounts] = useState({ projets: 0, clients: 0, entreprises: 0, ca: 0 });
  const [changes, setChanges] = useState({ projets: 0, clients: 0, entreprises: 0, ca: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [dataLoadedAt] = useState(() => Date.now());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const authUser = await getCurrentUser();
        if (!authUser) { setLoadingStats(false); return; }

        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

        const [
          { count: projetsTotal },
          { count: projetsThisMonth },
          { count: projetsLastMonth },
          { count: clientsTotal },
          { count: clientsThisMonth },
          { count: clientsLastMonth },
          { count: entreprisesTotal },
          { count: entreprisesThisMonth },
          { count: entreprisesLastMonth },
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
          supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lte('created_at', lastDayLastMonth),
          supabase.from('clients').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
          supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lte('created_at', lastDayLastMonth),
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
          supabase.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lte('created_at', lastDayLastMonth),
        ]);

        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        if (!mounted) return;

        console.log('📊 Dashboard Stats:', {
          projetsTotal,
          clientsTotal,
          entreprisesTotal,
          projetsThisMonth,
          clientsThisMonth,
          entreprisesThisMonth,
        });

        setCounts({
          projets: projetsTotal ?? 0,
          clients: clientsTotal ?? 0,
          entreprises: entreprisesTotal ?? 0,
          ca: 0,
        });
        setChanges({
          projets: calculateChange(projetsThisMonth ?? 0, projetsLastMonth ?? 0),
          clients: calculateChange(clientsThisMonth ?? 0, clientsLastMonth ?? 0),
          entreprises: calculateChange(entreprisesThisMonth ?? 0, entreprisesLastMonth ?? 0),
          ca: 0,
        });
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Stats avec pourcentages réels calculés
  const getTimeAgo = useCallback((date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }, []);

  const getQuickActions = useCallback(() => {
    if (isClient || isApporteur || isMandatary) {
      return [
        {
          icon: <Zap size={20} />,
          title: isClient ? 'Nouveau projet' : isApporteur ? 'Voir mes apports' : 'Créer un devis',
          description: isClient ? 'Démarrer un nouveau projet' : isApporteur ? 'Consulter mes commissions' : 'Nouveau devis client',
          action: 'Commencer',
          gradient: 'from-primary-50 to-primary-100',
          iconGradient: 'from-primary-500 to-primary-600',
        },
      ];
    }
    return [];
  }, [isClient, isApporteur, isMandatary]);

  const stats = useMemo(
    () => [
      {
        title: 'Projets Actifs',
        value: loadingStats ? '—' : counts.projets,
        icon: <Briefcase size={24} />,
        change: loadingStats ? '' : changes.projets === 0 ? '' : `${changes.projets > 0 ? '+' : ''}${changes.projets}%`,
        positive: changes.projets >= 0,
        gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
      },
      {
        title: 'Clients Actifs',
        value: loadingStats ? '—' : counts.clients,
        icon: <Users size={24} />,
        change: loadingStats ? '' : changes.clients === 0 ? '' : `${changes.clients > 0 ? '+' : ''}${changes.clients}%`,
        positive: changes.clients >= 0,
        gradient: 'bg-gradient-to-br from-success-600 to-success-800',
      },
      ...(isMandatary
        ? [
            {
              title: 'Devis en attente',
              value: loadingStats ? '—' : 0,
              icon: <FileText size={24} />,
              change: '',
              positive: true,
              gradient: 'bg-gradient-to-br from-warning-600 to-warning-800',
            },
            {
              title: 'Commissions',
              value: '—',
              icon: <Euro size={24} />,
              change: '',
              positive: true,
              gradient: 'bg-gradient-to-br from-accent-600 to-primary-600',
            },
          ]
        : [
            {
              title: 'Entreprises Partenaires',
              value: loadingStats ? '—' : counts.entreprises,
              icon: <Building size={24} />,
              change: loadingStats ? '' : changes.entreprises === 0 ? '' : `${changes.entreprises > 0 ? '+' : ''}${changes.entreprises}%`,
              positive: changes.entreprises >= 0,
              gradient: 'bg-gradient-to-br from-secondary-600 to-secondary-800',
            },
            {
              title: "Chiffre d'Affaires",
              value: loadingStats ? '—' : `${counts.ca.toLocaleString('fr-FR')} €`,
              icon: <Euro size={24} />,
              change: '',
              positive: true,
              gradient: 'bg-gradient-to-br from-accent-600 to-primary-600',
            },
          ]),
    ],
    [counts, changes, loadingStats, isMandatary],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const authUser = await getCurrentUser();
        if (!authUser || !mounted) return;

        // Récupérer les 5 projets les plus récents avec les infos du client via users
        const { data: projectsData } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            status,
            budget,
            created_at,
            client:client_id(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (projectsData && mounted) {
          const formattedProjects = projectsData.map((p: any) => ({
            title: p.title || 'Sans titre',
            client: p.client ? `${p.client.first_name || ''} ${p.client.last_name || ''}`.trim() || 'Client non défini' : 'Client non défini',
            budget: p.budget && typeof p.budget === 'object' && p.budget.total ? `${p.budget.total.toLocaleString('fr-FR')} €` : 'Non défini',
            progress: 0,
            status: p.status || 'pending',
            priority: 'medium',
          }));
          setRecentProjects(formattedProjects);
        }

        // Récupérer les logs d'audit pour les activités récentes
        const { data: auditData } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        if (auditData && mounted) {
          const activities = auditData.map((log: any) => {
            let icon = <FileText size={20} />;
            let type: 'success' | 'warning' | 'info' = 'info';

            if (log.action?.includes('create')) {
              icon = <Target size={20} />;
              type = 'success';
            } else if (log.action?.includes('delete')) {
              icon = <AlertTriangle size={20} />;
              type = 'warning';
            }

            const timeAgo = getTimeAgo(log.created_at);

            return {
              icon,
              title: log.action || 'Action',
              description: log.details || 'Activité système',
              time: timeAgo,
              type,
            };
          });
          setRecentActivities(activities);
        }
      } catch (error) {
        console.error('Erreur chargement activités:', error);
      }
    })();
    return () => { mounted = false; };
  }, [getTimeAgo]);

  // Redirection vers dashboard spécifique selon le rôle
  if (user) {
    const userRole = typeof user.role === 'string' ? user.role : 'unknown_role';
    if (userRole === 'client') return <ClientDashboard />;
    if (userRole === 'entreprise_partenaire' || userRole === 'partner_company') return <EntrepriseDashboard />;
    if (userRole === 'apporteur' || userRole === 'business_provider') return <ApporteurDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 -m-6 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Bonjour, {user?.firstName || 'Utilisateur'} 👋
            </h1>
            <p className="text-secondary-700 text-lg">
              {isMandatary ? 'Gérez vos projets et clients efficacement' : "Voici un aperçu de votre activité aujourd'hui"}
            </p>
          </div>

          <div className="flex items-center justify-center flex-shrink-0">
            <Logo size="xl" variant="full" />
          </div>
        </div>
      </div>

      {/* Statistiques dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={`${index}-${dataLoadedAt}`}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            positive={stat.positive}
            gradient={stat.gradient}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique des revenus (toujours mock pour l’instant) */}
        <div className="lg:col-span-2">
          <div className="bg-accent-500/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-accent-500/20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-700 bg-clip-text text-transparent">
                  Revenus Mensuels
                </h2>
                <p className="text-secondary-600">Aucune donnée disponible pour le moment</p>
              </div>
              <div className="flex items-center text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <ArrowUpRight size={20} className="mr-2" />
                <span className="font-semibold">—</span>
              </div>
            </div>

            <div className="h-80 flex items-end space-x-3">
              {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      i === 11
                        ? 'bg-gradient-to-t from-primary-500 to-secondary-700 shadow-lg'
                        : 'bg-gradient-to-t from-secondary-200 to-secondary-300 hover:from-primary-200 hover:to-secondary-400'
                    }`}
                    style={{ height: `${height * 3}px` }}
                  />
                  <span className="text-xs text-secondary-600 mt-2 font-medium">
                    {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activité récente (mock) */}
        <div>
          <div className="bg-accent-500/90 backdrop-blur-sm rounded-3xl shadow-xl border border-accent-500/20 h-fit">
            <div className="p-6 border-b border-gray-100/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-700 bg-clip-text text-transparent">
                Activité Récente
              </h2>
              <p className="text-secondary-600">Dernières actions sur la plateforme</p>
            </div>

            <div className="p-2">
              {recentActivities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  type={activity.type}
                />
              ))}
            </div>

            <div className="p-6 border-t border-gray-100/50">
              <Button variant="outline" fullWidth>Voir toute l'activité</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projets récents + Commissions/Alertes (mocks) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Projets Récents
                </h2>
                <p className="text-neutral-600">Suivi de vos projets en cours</p>
              </div>
              <Button variant="outline" size="sm">Voir tous</Button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {recentProjects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
              {isClient ? 'Mes Documents' : isApporteur || isMandatary ? 'Mes Commissions' : 'Commissions'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg">
                    <Euro size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-neutral-900">
                      {isClient ? 'Documents validés' : (isApporteur || isMandatary) ? 'Mes commissions' : 'Ce mois'}
                    </p>
                    <p className="text-sm text-neutral-600">Mois courant</p>
                  </div>
                </div>
                <p className="font-bold text-2xl text-neutral-900">
                  {isClient ? '2/3' : (isApporteur || isMandatary) ? '—' : '—'}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg">
                    <Clock size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-neutral-900">
                      {isClient ? 'En attente' : (isApporteur || isMandatary) ? 'À recevoir' : 'En attente'}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {isClient ? 'Validation documents' : (isApporteur || isMandatary) ? 'Commissions' : 'Projets en cours'}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-2xl text-neutral-900">—</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-warning-600 to-error-600 bg-clip-text text-transparent mb-6">
              {isClient || isApporteur || isMandatary ? 'Actions Rapides' : 'Alertes Importantes'}
            </h2>

            <div className="space-y-4">
              {getQuickActions().map((action, index) => (
                <div
                  key={index}
                  className={`flex items-start p-4 bg-gradient-to-r ${action.gradient} rounded-xl border border-primary-200`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.iconGradient} text-white mr-4 shadow-lg`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{action.title}</p>
                    <p className="text-sm text-neutral-600">{action.description}</p>
                    <Button variant="outline" size="sm" className="mt-2">{action.action}</Button>
                  </div>
                </div>
              ))}

              {[
                {
                  icon: <AlertTriangle size={20} />,
                  title: 'Document expirant',
                  description: 'Assurance décennale expire dans 30 jours',
                  gradient: 'from-warning-50 to-warning-100',
                  iconGradient: 'from-warning-500 to-warning-600',
                },
              ].map((alert, index) => (
                <div
                  key={`alert-${index}`}
                  className={`flex items-start p-4 bg-gradient-to-r ${alert.gradient} rounded-xl border border-warning-200`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${alert.iconGradient} text-white mr-4 shadow-lg`}>
                    {alert.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{alert.title}</p>
                    <p className="text-sm text-neutral-600">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import ClientDashboard from './ClientDashboard';
import EntrepriseDashboard from './EntrepriseDashboard';
import ApporteurDashboard from './ApporteurDashboard';

export default DashboardPage;

