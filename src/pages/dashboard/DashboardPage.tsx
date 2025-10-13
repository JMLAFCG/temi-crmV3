import React, { useState, useMemo, useCallback } from 'react';
import {
  Briefcase,
  Users,
  Building,
  FileText,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpRight,
  Euro,
  AlertTriangle,
  Search,
  Bell,
  MessageSquare,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';

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
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
    </div>
  );
};

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
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };

  const statusLabels = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-1 h-12 rounded-full ${priorityColors[priority]}`}></div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
            <p className="text-gray-600">Client: {client}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}
        >
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
          ></div>
        </div>
      </div>
    </div>
  );
};

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
  };

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
import ClientDashboard from './ClientDashboard';
import EntrepriseDashboard from './EntrepriseDashboard';
import ApporteurDashboard from './ApporteurDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Redirection automatique vers le dashboard spécifique selon le rôle
  if (user) {
    const userRole = typeof user.role === 'string' ? user.role : 'unknown_role';
    switch (userRole) {
      case 'client':
        return <ClientDashboard />;
      case 'entreprise_partenaire':
      case 'partner_company':
        return <EntrepriseDashboard />;
      case 'apporteur':
      case 'business_provider':
        return <ApporteurDashboard />;
      // Les autres rôles (admin, manager, commercial, mandatary) utilisent le dashboard principal
    }
  }

  // Interface simplifiée pour les mandataires
  const isClient = String(user?.role) === 'client';
  const isApporteur = String(user?.role) === 'apporteur';
  const isMandatary = String(user?.role) === 'mandatary';

  const stats = useMemo(() => [
    {
      title: 'Projets Actifs',
      value: 24,
      icon: <Briefcase size={24} />,
      change: '+12%',
      positive: true,
      gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
    },
    {
      title: 'Clients Actifs',
      value: 18,
      icon: <Users size={24} />,
      change: '+5%',
      positive: true,
      gradient: 'bg-gradient-to-br from-success-600 to-success-800',
    },
    ...(isMandatary
      ? [
          {
            title: 'Devis en attente',
            value: 8,
            icon: <FileText size={24} />,
            change: '+3',
            positive: true,
            gradient: 'bg-gradient-to-br from-warning-600 to-warning-800',
          },
          {
            title: 'Commissions',
            value: '12.5k€',
            icon: <Euro size={24} />,
            change: '+8%',
            positive: true,
            gradient: 'bg-gradient-to-br from-accent-600 to-primary-600',
          },
        ]
      : [
          {
            title: 'Entreprises Partenaires',
            value: 42,
            icon: <Building size={24} />,
            change: '+8%',
            positive: true,
            gradient: 'bg-gradient-to-br from-secondary-600 to-secondary-800',
          },
          {
            title: "Chiffre d'Affaires",
            value: '156k€',
            icon: <Euro size={24} />,
            change: '+15%',
            positive: true,
            gradient: 'bg-gradient-to-br from-accent-600 to-primary-600',
          },
        ]),
  ], [isMandatary]);

  const recentActivities = useMemo(() => [
    {
      icon: <Target size={20} />,
      title: 'Nouveau projet créé',
      description: 'Projet de rénovation pour Martin Dupont',
      time: 'Il y a 2h',
      type: 'success' as const,
    },
    {
      icon: <FileText size={20} />,
      title: 'Document téléchargé',
      description: "Plan d'étage pour le projet #1234",
      time: 'Il y a 4h',
      type: 'info' as const,
    },
    {
      icon: <Award size={20} />,
      title: 'Nouvelle entreprise partenaire',
      description: 'Électricité Moderne a rejoint la plateforme',
      time: 'Hier',
      type: 'success' as const,
    },
    {
      icon: <AlertTriangle size={20} />,
      title: 'Document expirant',
      description: 'Assurance décennale expire dans 30 jours',
      time: 'Il y a 1 jour',
      type: 'warning' as const,
    },
  ], []);

  const recentProjects = useMemo(() => [
    {
      title: 'Rénovation Cuisine Moderne',
      client: 'Martin Dupont',
      budget: '25 000 €',
      progress: 65,
      status: 'in_progress' as const,
      priority: 'high' as const,
    },
    {
      title: 'Extension Maison',
      client: 'Sophie Martin',
      budget: '75 000 €',
      progress: 10,
      status: 'pending' as const,
      priority: 'medium' as const,
    },
    {
      title: 'Rénovation Salle de Bain',
      client: 'Jean Petit',
      budget: '12 000 €',
      progress: 100,
      status: 'completed' as const,
      priority: 'low' as const,
    },
  ], []);

  const getQuickActions = useCallback(() => {
    if (isClient || isApporteur || isMandatary) {
      return [
        {
          icon: <Zap size={20} />,
          title: isClient
            ? 'Nouveau projet'
            : isApporteur
              ? 'Voir mes apports'
              : isMandatary
                ? 'Créer un devis'
                : 'Action rapide',
          description: isClient
            ? 'Démarrer un nouveau projet'
            : isApporteur
              ? 'Consulter mes commissions'
              : 'Nouveau devis client',
          action: 'Commencer',
          gradient: 'from-primary-50 to-primary-100',
          iconGradient: 'from-primary-500 to-primary-600',
        },
      ];
    }
    return [];
  }, [isClient, isApporteur, isMandatary]);

  const getAlerts = useCallback(() => {
    return [
      {
        icon: <AlertTriangle size={20} />,
        title: 'Document expirant',
        description: 'Assurance décennale expire dans 30 jours',
        gradient: 'from-warning-50 to-warning-100',
        iconGradient: 'from-warning-500 to-warning-600',
      },
    ];
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 -m-6 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center mb-4">
              <Logo size="lg" variant="full" className="mr-3" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Bonjour, {user?.firstName || 'Utilisateur'} 👋
            </h1>
            <p className="text-secondary-700 text-lg">
              {isMandatary
                ? 'Gérez vos projets et clients efficacement'
                : "Voici un aperçu de votre activité aujourd'hui"}
            </p>
          </div>

          <div className="mt-6 lg:mt-0 flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-12 pr-4 py-3 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-accent-500/80 backdrop-blur-sm shadow-lg w-80 placeholder-gray-500"
              />
            </div>

            <button className="p-3 rounded-2xl bg-accent-500/80 backdrop-blur-sm text-primary-600 relative shadow-lg hover:shadow-xl hover:bg-accent-500 transition-all duration-200 transform hover:scale-105">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning-600 rounded-full animate-pulse"></span>
            </button>

            <button className="p-3 rounded-2xl bg-accent-500/80 backdrop-blur-sm text-primary-600 relative shadow-lg hover:shadow-xl hover:bg-accent-500 transition-all duration-200 transform hover:scale-105">
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
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
        {/* Graphique des revenus */}
        <div className="lg:col-span-2">
          <div className="bg-accent-500/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-accent-500/20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-700 bg-clip-text text-transparent">
                  Revenus Mensuels
                </h2>
                <p className="text-secondary-600">Performance de l'année en cours</p>
              </div>
              <div className="flex items-center text-success-600 bg-success-50 px-4 py-2 rounded-xl border border-success-200">
                <ArrowUpRight size={20} className="mr-2" />
                <span className="font-semibold">+12.5%</span>
              </div>
            </div>

            <div className="h-80 flex items-end space-x-3">
              {[35, 45, 30, 25, 40, 50, 60, 45, 50, 55, 70, 65].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 delay-${i * 100} ${
                      i === 11
                        ? 'bg-gradient-to-t from-primary-500 to-secondary-700 shadow-lg'
                        : 'bg-gradient-to-t from-secondary-200 to-secondary-300 hover:from-primary-200 hover:to-secondary-400 transition-all duration-300'
                    }`}
                    style={{ height: `${height * 3}px` }}
                  ></div>
                  <span className="text-xs text-secondary-600 mt-2 font-medium">
                    {
                      [
                        'Jan',
                        'Fév',
                        'Mar',
                        'Avr',
                        'Mai',
                        'Jun',
                        'Jul',
                        'Aoû',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Déc',
                      ][i]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activité récente */}
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
              <Button variant="outline" fullWidth>
                Voir toute l'activité
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Projets récents */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Projets Récents
                </h2>
                <p className="text-neutral-600">Suivi de vos projets en cours</p>
              </div>
              <Button variant="outline" size="sm">
                Voir tous
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {recentProjects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                client={project.client}
                budget={project.budget}
                progress={project.progress}
                status={project.status}
                priority={project.priority}
              />
            ))}
          </div>
        </div>

        {/* Commissions et alertes */}
        <div className="space-y-6">
          {/* Commissions ou alertes selon le rôle */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
              {isClient
                ? 'Mes Documents'
                : isApporteur
                  ? 'Mes Commissions'
                  : isMandatary
                    ? 'Mes Commissions'
                    : 'Commissions'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg">
                    <Euro size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-neutral-900">
                      {isClient
                        ? 'Documents validés'
                        : isApporteur
                          ? 'Mes commissions'
                          : isMandatary
                            ? 'Mes commissions'
                            : 'Ce mois'}
                    </p>
                    <p className="text-sm text-neutral-600">Mai 2025</p>
                  </div>
                </div>
                <p className="font-bold text-2xl text-neutral-900">
                  {isClient ? '2/3' : isApporteur ? '2 150 €' : isMandatary ? '3 250 €' : '8 750 €'}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg">
                    <Clock size={20} />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-neutral-900">
                      {isClient
                        ? 'En attente'
                        : isApporteur
                          ? 'À recevoir'
                          : isMandatary
                            ? 'À recevoir'
                            : 'En attente'}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {isClient
                        ? 'Validation documents'
                        : isApporteur
                          ? 'Commissions'
                          : isMandatary
                            ? 'Commissions'
                            : 'Projets en cours'}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-2xl text-neutral-900">
                  {isClient ? '1' : isApporteur ? '850 €' : isMandatary ? '1 850 €' : '12 350 €'}
                </p>
              </div>
            </div>
          </div>

          {/* Alertes ou actions rapides selon le rôle */}
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
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${action.iconGradient} text-white mr-4 shadow-lg`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{action.title}</p>
                    <p className="text-sm text-neutral-600">{action.description}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      {action.action}
                    </Button>
                  </div>
                </div>
              ))}

              {getAlerts().map((alert, index) => (
                <div
                  key={`alert-${index}`}
                  className={`flex items-start p-4 bg-gradient-to-r ${alert.gradient} rounded-xl border border-warning-200`}
                >
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${alert.iconGradient} text-white mr-4 shadow-lg`}
                  >
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

export default DashboardPage;
