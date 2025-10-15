import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Filter, Search, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

type ProjectStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface ProjectCardProps {
  id: string;
  title: string;
  clientName: string;
  type: string[];       // tags affichés (extraits de activities)
  status: ProjectStatus;
  budget?: number;      // total calculé à partir du JSON budget
  progress: number;     // 0 par défaut (pas de colonne en DB)
  dueDate?: string;     // timeline.endDate si présente
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  clientName,
  type,
  status,
  budget,
  progress,
  dueDate,
}) => {
  const navigate = useNavigate();

  const statusColors: Record<ProjectStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<ProjectStatus, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Client: {clientName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="mb-4">
        {!!type?.length && (
          <div className="flex flex-wrap gap-2 mb-2">
            {type.map((t) => (
              <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                {t}
              </span>
            ))}
          </div>
        )}

        {typeof budget === 'number' && (
          <p className="text-sm text-gray-700">
            Budget{' '}
            <span className="font-semibold">
              {budget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </p>
        )}

        {dueDate && (
          <p className="text-sm text-gray-700">
            Date limite{' '}
            <span className="font-semibold">
              {new Date(dueDate).toLocaleDateString('fr-FR')}
            </span>
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600">Progression</span>
          <span className="text-xs font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/projects/${id}`)}>
          Voir les détails
        </Button>
      </div>
    </div>
  );
};

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isMandatary = user?.role === 'mandatary';

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Jointure client via ta contrainte exacte 'projects_client_id_fkey'
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            status,
            budget,
            timeline,
            activities,
            created_at,
            is_demo,
            client:users!projects_client_id_fkey(first_name,last_name,full_name)
          `)
          .eq('is_demo', false) // on masque les éventuels projets de démo
          .order('created_at', { ascending: false });

        if (error) throw error;

        const adapted: ProjectCardProps[] = (data ?? []).map((p: any) => {
          const clientName =
            p.client?.full_name ||
            [p.client?.first_name, p.client?.last_name].filter(Boolean).join(' ') ||
            '—';

          const materials = Number(p.budget?.materials ?? 0);
          const labor     = Number(p.budget?.labor ?? 0);
          const services  = Number(p.budget?.services ?? 0);
          const budgetTotal =
            Number.isFinite(materials + labor + services)
              ? materials + labor + services
              : undefined;

          const dueDate = p.timeline?.endDate ?? p.timeline?.end_date ?? undefined;

          return {
            id: p.id,
            title: p.title ?? 'Sans titre',
            clientName,
            type: Array.isArray(p.activities) ? p.activities.slice(0, 3) : [],
            status: (p.status ?? 'draft') as ProjectStatus,
            budget: budgetTotal,
            progress: 0,
            dueDate,
          };
        });

        if (mounted) setProjects(adapted);
      } catch (e: any) {
        console.error('Chargement projets:', e);
        if (mounted) setLoadError(e?.message || 'Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.clientName || '').toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600">Gérez et suivez tous vos projets</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/projects/create')}
          >
            Nouveau Projet
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher des projets..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            rightIcon={<ChevronDown size={16} />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filtrer
          </Button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <div className="space-y-2">
                  {(isMandatary
                    ? ['Mes projets', 'En cours', 'Terminé']
                    : ['Tous', 'Brouillon', 'En attente', 'En cours', 'Terminé', 'Annulé']
                  ).map((status) => (
                    <div key={status} className="flex items-center">
                      <input
                        id={`status-${status}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interface conservée, mais les tags proviennent de activities */}
              {!isMandatary && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="space-y-2">
                    {['Rénovation', 'Extension', 'Construction', 'Aménagement', 'Sinistre'].map(
                      (type) => (
                        <div key={type} className="flex items-center">
                          <input
                            id={`type-${type}`}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                            {type}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="primary" size="sm">
                  {isMandatary ? 'Filtrer' : 'Appliquer les filtres'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="text-center text-gray-500 py-10">Chargement des projets…</div>}
      {loadError && !loading && (
        <div className="text-center text-red-600 py-10">{loadError}</div>
      )}
      {!loading && !loadError && filteredProjects.length === 0 && (
        <div className="text-center text-gray-500 py-10">Aucun projet à afficher.</div>
      )}

      {!loading && !loadError && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;

