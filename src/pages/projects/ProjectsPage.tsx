import React, { useState } from 'react';
import { Plus, Filter, Search, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

type ProjectType =
  | 'renovation'
  | 'extension'
  | 'construction'
  | 'development'
  | 'disaster_recovery';
type ProjectStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface ProjectCardProps {
  id: string;
  title: string;
  clientName: string;
  type: ProjectType[];
  status: ProjectStatus;
  budget?: number;
  progress: number;
  dueDate?: string;
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

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const typeLabels: Record<ProjectType, string> = {
    renovation: 'Rénovation',
    extension: 'Extension',
    construction: 'Construction',
    development: 'Aménagement',
    disaster_recovery: 'Sinistre',
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
        <div className="flex flex-wrap gap-2 mb-2">
          {type.map(t => (
            <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
              {typeLabels[t]}
            </span>
          ))}
        </div>

        {budget && (
          <p className="text-sm text-gray-700">
            Budget:{' '}
            <span className="font-semibold">
              {budget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </p>
        )}

        {dueDate && (
          <p className="text-sm text-gray-700">
            Date limite:{' '}
            <span className="font-semibold">{new Date(dueDate).toLocaleDateString()}</span>
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

  const isMandatary = user?.role === 'mandatary';

  // Mock data - in a real app, this would come from an API
  const projects: ProjectCardProps[] = [
    {
      id: '1',
      title: 'Rénovation Cuisine Moderne',
      clientName: 'Martin Dupont',
      type: ['renovation'],
      status: 'in_progress',
      budget: 25000,
      progress: 65,
      dueDate: '2025-06-15',
    },
    {
      id: '2',
      title: 'Extension Maison',
      clientName: 'Sophie Martin',
      type: ['extension'],
      status: 'pending',
      budget: 75000,
      progress: 10,
      dueDate: '2025-08-30',
    },
    {
      id: '3',
      title: 'Nouvel Immeuble de Bureaux',
      clientName: 'Entreprises Leroy',
      type: ['construction'],
      status: 'draft',
      budget: 450000,
      progress: 5,
    },
    {
      id: '4',
      title: 'Rénovation Salle de Bain',
      clientName: 'Jean Petit',
      type: ['renovation'],
      status: 'completed',
      budget: 12000,
      progress: 100,
      dueDate: '2025-04-10',
    },
    {
      id: '5',
      title: 'Restauration Dégâts des Eaux',
      clientName: 'Marie Dubois',
      type: ['disaster_recovery'],
      status: 'in_progress',
      budget: 35000,
      progress: 40,
      dueDate: '2025-05-20',
    },
    {
      id: '6',
      title: 'Aménagement Jardin',
      clientName: 'Pierre Lefebvre',
      type: ['development'],
      status: 'pending',
      budget: 8500,
      progress: 0,
      dueDate: '2025-07-05',
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600">Gérez et suivez tous vos projets de construction</p>
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
            onChange={e => setSearchQuery(e.target.value)}
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
                  ).map(status => (
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

              {!isMandatary && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="space-y-2">
                    {['Rénovation', 'Extension', 'Construction', 'Aménagement', 'Sinistre'].map(
                      type => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
