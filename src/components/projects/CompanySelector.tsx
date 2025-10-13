import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Building2,
  MapPin,
  Star,
  CheckCircle,
  AlertTriangle,
  Award,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  findMatchingCompanies,
  getMockMatchingCompanies,
  notifyMatchingCompanies,
} from '../../utils/companyMatching';
import { Project } from '../../types';

interface CompanySelectorProps {
  project: Partial<Project>;
  onCompaniesSelected: (companies: any[]) => void;
}

interface CompanyCardProps {
  company: any;
  isSelected: boolean;
  onToggle: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isSelected, onToggle }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getResponseTimeText = (hours: number) => {
    if (hours <= 2) return 'Très rapide';
    if (hours <= 6) return 'Rapide';
    if (hours <= 24) return 'Modéré';
    return 'Lent';
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50'
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      <div className="p-6">
        {/* En-tête avec nom et statut */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-gray-500">
                <MapPin size={14} className="mr-1" />
                <span className="text-sm">{Math.round(company.distance)} km</span>
              </div>
              {company.verification_status === 'verified' && (
                <div className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200">
                  <CheckCircle size={12} className="mr-1" />
                  Vérifié
                </div>
              )}
            </div>
          </div>

          {/* Score de matching */}
          <div className="text-right">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(company.matching_score)}`}
            >
              <Star size={14} className="mr-1" />
              {Math.round(company.matching_score * 100)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Score de matching</p>
          </div>
        </div>

        {/* Indicateurs de performance */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Award size={14} className="text-yellow-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {company.average_rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500">Note</p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target size={14} className="text-blue-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">{company.success_rate}%</span>
            </div>
            <p className="text-xs text-gray-500">Succès</p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock size={14} className="text-purple-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {company.estimatedResponseTime}h
              </span>
            </div>
            <p className="text-xs text-gray-500">Réponse</p>
          </div>
        </div>

        {/* Activités correspondantes */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Building2 size={16} className="text-gray-400 mr-1" />
            <span className="text-sm font-medium text-gray-700">
              Activités {company.canHandleAllActivities ? '(Complètes)' : '(Partielles)'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {company.activities.slice(0, 4).map((activity: string) => (
              <span
                key={activity}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
              >
                {activity}
              </span>
            ))}
            {company.activities.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{company.activities.length - 4}
              </span>
            )}
          </div>

          {company.missingActivities.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-amber-600 mb-1">Activités manquantes:</p>
              <div className="flex flex-wrap gap-1">
                {company.missingActivities.slice(0, 3).map((activity: string) => (
                  <span
                    key={activity}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scores détaillés */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Analyse détaillée</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Activités</span>
              <div className="flex items-center">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-1.5 bg-primary-500 rounded-full"
                    style={{ width: `${company.activityScore * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {Math.round(company.activityScore * 100)}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Proximité</span>
              <div className="flex items-center">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-1.5 bg-secondary-500 rounded-full"
                    style={{ width: `${company.locationScore * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {Math.round(company.locationScore * 100)}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Fiabilité</span>
              <div className="flex items-center">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-1.5 bg-success-500 rounded-full"
                    style={{ width: `${company.reliabilityScore * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {Math.round(company.reliabilityScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de sélection */}
        <Button
          variant={isSelected ? 'primary' : 'outline'}
          fullWidth
          onClick={onToggle}
          leftIcon={company.canHandleAllActivities ? <Zap size={16} /> : undefined}
        >
          {isSelected ? 'Sélectionné' : 'Sélectionner'}
          {company.canHandleAllActivities && !isSelected && (
            <span className="ml-2 text-xs">(Recommandé)</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  project,
  onCompaniesSelected,
}) => {
  const [matchedCompanies, setMatchedCompanies] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'rating'>('score');

  useEffect(() => {
    if (project.activities?.length && project.location) {
      handleFindCompanies();
    }
  }, [project]);

  const handleFindCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Recherche d'entreprises pour le projet:", project);

      // Préparer les critères de matching
      const criteria = {
        activities: project.activities || [],
        intellectualServices: project.intellectual_services || [],
        location: {
          lat: project.location?.coordinates?.lat || 48.8566,
          lng: project.location?.coordinates?.lng || 2.3522,
          address: project.location?.address || '',
          city: project.location?.city || '',
          postalCode: project.location?.postalCode || '',
        },
        timeline: {
          startDate: project.timeline?.startDate || new Date().toISOString(),
          endDate:
            project.timeline?.endDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: project.timeline?.estimatedDuration || 30,
        },
        budget: {
          total: project.budget?.total || 0,
          materials: project.budget?.materials || 0,
          labor: project.budget?.labor || 0,
        },
      };

      let companies;
      try {
        // Essayer d'abord avec Supabase
        companies = await findMatchingCompanies(project as Project, criteria);
      } catch (supabaseError) {
        console.warn('Erreur Supabase, utilisation des données mock:', supabaseError);
        // Fallback vers les données mock
        companies = getMockMatchingCompanies(criteria);
      }

      console.log(`✅ ${companies.length} entreprises trouvées`);
      setMatchedCompanies(companies);
    } catch (err) {
      console.error("Erreur lors de la recherche d'entreprises:", err);
      setError("Erreur lors de la recherche d'entreprises");

      // En cas d'erreur, utiliser les données mock
      const mockCriteria = {
        activities: project.activities || [],
        intellectualServices: project.intellectual_services || [],
        location: {
          lat: 48.8566,
          lng: 2.3522,
          address: '',
          city: '',
          postalCode: '',
        },
        timeline: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDuration: 30,
        },
        budget: { total: 0, materials: 0, labor: 0 },
      };
      setMatchedCompanies(getMockMatchingCompanies(mockCriteria));
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId]
    );
  };

  const filteredAndSortedCompanies = matchedCompanies
    .filter(
      company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.activities.some((activity: string) =>
          activity.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'score':
        default:
          // Prioriser les entreprises complètes
          if (a.canHandleAllActivities && !b.canHandleAllActivities) return -1;
          if (!a.canHandleAllActivities && b.canHandleAllActivities) return 1;
          return b.matching_score - a.matching_score;
      }
    });

  const handleValidateSelection = async () => {
    const selectedCompanyData = matchedCompanies.filter(c => selectedCompanies.includes(c.id));

    // Notifier les entreprises sélectionnées
    if (selectedCompanyData.length > 0 && project.id) {
      try {
        await notifyMatchingCompanies(selectedCompanyData, project as Project);
        console.log('✅ Entreprises notifiées avec succès');
      } catch (notificationError) {
        console.warn('Erreur lors de la notification:', notificationError);
      }
    }

    onCompaniesSelected(selectedCompanyData);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      {matchedCompanies.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4 border border-primary-200">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent mb-2">
            Entreprises recommandées
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total trouvées:</span>
              <span className="ml-2 font-semibold text-gray-900">{matchedCompanies.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Complètes:</span>
              <span className="ml-2 font-semibold text-green-700">
                {matchedCompanies.filter(c => c.canHandleAllActivities).length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Moyenne score:</span>
              <span className="ml-2 font-semibold text-blue-700">
                {Math.round(
                  (matchedCompanies.reduce((sum, c) => sum + c.matching_score, 0) /
                    matchedCompanies.length) *
                    100
                )}
                %
              </span>
            </div>
            <div>
              <span className="text-gray-600">Distance moy:</span>
              <span className="ml-2 font-semibold text-purple-700">
                {Math.round(
                  matchedCompanies.reduce((sum, c) => sum + c.distance, 0) / matchedCompanies.length
                )}{' '}
                km
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Trier par:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="score">Score de matching</option>
            <option value="distance">Distance</option>
            <option value="rating">Note client</option>
          </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtres avancés
                </label>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Score minimum</label>
                    <input type="range" min="0" max="100" className="w-full" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Distance maximum (km)
                    </label>
                    <input type="range" min="0" max="100" className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verified-only"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="verified-only" className="ml-2 text-xs text-gray-700">
                        Entreprises vérifiées uniquement
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="complete-only"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="complete-only" className="ml-2 text-xs text-gray-700">
                        Peut gérer toutes les activités
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm">
                  Appliquer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors de la recherche d'entreprises
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedCompanies.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              isSelected={selectedCompanies.includes(company.id)}
              onToggle={() => toggleCompanySelection(company.id)}
            />
          ))}
        </div>
      )}

      {selectedCompanies.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-900">
                {selectedCompanies.length} entreprise{selectedCompanies.length > 1 ? 's' : ''}{' '}
                sélectionnée{selectedCompanies.length > 1 ? 's' : ''}
              </span>
              <p className="text-xs text-gray-500">
                Les entreprises seront automatiquement notifiées
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleValidateSelection}
              leftIcon={<Zap size={16} />}
            >
              Notifier les entreprises
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
