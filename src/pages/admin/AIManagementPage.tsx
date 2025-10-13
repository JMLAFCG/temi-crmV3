import React, { useState, useEffect } from 'react';
import {
  Brain,
  BarChart,
  Settings,
  FileText,
  Building,
  Users,
  Zap,
  Target,
  Award,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AdminAIManager } from '../../components/ai/AdminAIManager';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface ProjectWithAI {
  id: string;
  title: string;
  client_name: string;
  analyses_count: number;
  proposition_status: string;
  admin_validated: boolean;
  created_at: string;
}

export const AIManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectWithAI[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeAnalyses: 0,
    validatedPropositions: 0,
    averageQuality: 0,
  });

  useEffect(() => {
    fetchAIProjects();
    fetchAIStats();
  }, []);

  const fetchAIProjects = async () => {
    setLoading(true);
    try {
      // Récupérer d'abord les projets de base
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, client_id, created_at')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Récupérer les informations clients
      const clientIds = projectsData?.map(p => p.client_id).filter(Boolean) || [];
      const { data: clientsData } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .in('id', clientIds);

      // Créer un map des clients
      const clientsMap = new Map(clientsData?.map(c => [c.id, c]) || []);

      // Créer les projets avec données simulées pour la démo
      const projectsWithAI = (projectsData || []).map(project => {
        const client = clientsMap.get(project.client_id);
        return {
          id: project.id,
          title: project.title,
          client_name: client ? `${client.first_name} ${client.last_name}` : 'Client inconnu',
          analyses_count: Math.floor(Math.random() * 5) + 1, // Données simulées
          proposition_status: Math.random() > 0.5 ? 'soumise' : 'none',
          admin_validated: Math.random() > 0.7,
          created_at: project.created_at,
        };
      });

      setProjects(projectsWithAI);
    } catch (error) {
      console.error('Erreur chargement projets IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIStats = async () => {
    try {
      // Utiliser les données existantes pour les statistiques
      const { data: projectsCount } = await supabase
        .from('projects')
        .select('id', { count: 'exact' });

      // Statistiques simulées en attendant les vraies tables
      const totalProjects = projectsCount?.length || 0;
      const activeAnalyses = Math.floor(totalProjects * 0.7);
      const validatedPropositions = Math.floor(totalProjects * 0.4);
      const averageQuality = 87; // Qualité simulée

      setStats({
        totalProjects,
        activeAnalyses,
        validatedPropositions,
        averageQuality,
      });
    } catch (error) {
      console.error('Erreur chargement statistiques IA:', error);
    }
  };

  // Vérification des permissions
  const canManageAI = user && ['admin', 'manager', 'commercial', 'mandatary'].includes(user.role);

  if (!canManageAI) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">Vous n'avez pas accès à la gestion du module IA.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion IA des Devis</h1>
          <p className="text-gray-600">Administration du module d'intelligence artificielle</p>
        </div>
      </div>

      {/* Statistiques IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Projets avec IA</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </div>
            <Brain className="text-blue-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Analyses terminées</p>
              <p className="text-2xl font-bold">{stats.activeAnalyses}</p>
            </div>
            <Target className="text-green-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Propositions validées</p>
              <p className="text-2xl font-bold">{stats.validatedPropositions}</p>
            </div>
            <Award className="text-purple-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Qualité moyenne</p>
              <p className="text-2xl font-bold">{stats.averageQuality}%</p>
            </div>
            <Zap className="text-orange-200" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des projets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Projets avec IA</h3>
            <p className="text-sm text-gray-600">Sélectionnez un projet pour gérer l'IA</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedProject === project.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600">{project.client_name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {project.analyses_count} devis analysés
                      </span>
                      {project.admin_validated && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Validé
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.proposition_status === 'soumise'
                          ? 'bg-blue-100 text-blue-800'
                          : project.proposition_status === 'validee'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.proposition_status === 'soumise'
                        ? 'Soumise'
                        : project.proposition_status === 'validee'
                          ? 'Validée'
                          : 'En attente'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gestionnaire IA pour le projet sélectionné */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <AdminAIManager
              projetId={selectedProject}
              onPropositionUpdated={() => {
                fetchAIProjects();
                fetchAIStats();
              }}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Brain size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez un projet</h3>
              <p className="text-gray-600">
                Choisissez un projet dans la liste pour gérer ses analyses IA et négociations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIManagementPage;
