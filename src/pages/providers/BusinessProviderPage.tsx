import React, { useState } from 'react';
import { Plus, Filter, Search, ChevronDown, User, Mail, Phone, MapPin, Euro } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface BusinessProviderCardProps {
  id: string;
  type: 'individual' | 'company';
  first_name: string;
  last_name: string;
  company_name?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  projectsCount: number;
  totalCommissions: number;
  pendingCommissions: number;
  status: 'active' | 'inactive';
  verification_status: 'pending' | 'verified' | 'rejected';
}

const BusinessProviderCard: React.FC<BusinessProviderCardProps> = ({
  id,
  type,
  first_name,
  last_name,
  company_name,
  name,
  email,
  phone,
  address,
  projectsCount,
  totalCommissions,
  pendingCommissions,
  status,
  verification_status,
}) => {
  const navigate = useNavigate();

  const displayName = type === 'company' ? company_name : `${first_name} ${last_name}`;
  const subtitle =
    type === 'company' ? `Représentant: ${first_name} ${last_name}` : 'Apporteur individuel';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
            <span
              className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {status === 'active' ? 'Actif' : 'Inactif'}
            </span>
            <span
              className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                verification_status === 'verified'
                  ? 'bg-blue-100 text-blue-800'
                  : verification_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {verification_status === 'verified'
                ? 'Vérifié'
                : verification_status === 'rejected'
                  ? 'Rejeté'
                  : 'En attente'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" />
              {email}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Phone size={16} className="mr-2 text-gray-400" />
              {phone}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin size={16} className="mr-2 text-gray-400" />
              {address}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Projets apportés</p>
          <p className="text-xl font-semibold text-gray-900">{projectsCount}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Commissions en attente</p>
          <p className="text-xl font-semibold text-gray-900">{pendingCommissions}€</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-500">
            <Euro size={16} className="mr-1" />
            <span className="text-sm">Total: {totalCommissions}€</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/providers/${id}`)}>
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
};

const BusinessProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const { user } = useAuthStore();

  // ⚠️ IMPORTANT : hook state AVANT tout return conditionnel
  const [providers, setProviders] = useState<BusinessProviderCardProps[]>([
    {
      id: '1',
      type: 'individual',
      first_name: 'Thomas',
      last_name: 'Durand',
      name: 'Thomas Durand',
      email: 'thomas.durand@example.com',
      phone: '06 12 34 56 78',
      address: 'Paris',
      projectsCount: 12,
      totalCommissions: 24500,
      pendingCommissions: 3500,
      status: 'active',
      verification_status: 'verified',
    },
    {
      id: '2',
      type: 'company',
      first_name: 'Sophie',
      last_name: 'Martin',
      company_name: 'Électricité Moderne SARL',
      name: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      phone: '06 23 45 67 89',
      address: 'Lyon',
      projectsCount: 8,
      totalCommissions: 15800,
      pendingCommissions: 2200,
      status: 'active',
      verification_status: 'pending',
    },
    {
      id: '3',
      type: 'individual',
      first_name: 'Jean',
      last_name: 'Petit',
      name: 'Jean Petit',
      email: 'jean.petit@example.com',
      phone: '06 34 56 78 90',
      address: 'Marseille',
      projectsCount: 5,
      totalCommissions: 9500,
      pendingCommissions: 1500,
      status: 'inactive',
      verification_status: 'rejected',
    },
    {
      id: '4',
      type: 'company',
      first_name: 'Marc',
      last_name: 'Dubois',
      company_name: 'Électricité Moderne',
      name: 'Électricité Moderne',
      email: 'contact@electricite-moderne.fr',
      phone: '01 23 45 67 89',
      address: 'Paris',
      projectsCount: 6,
      totalCommissions: 8500,
      pendingCommissions: 1200,
      status: 'active',
      verification_status: 'verified',
    },
  ]);

  // Vérification des permissions (rendu alternatif, plus de return avant hooks)
  const hasAccess = user?.role === 'admin' || user?.role === 'manager';

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">
            Seuls les administrateurs et gestionnaires peuvent accéder à la gestion des apporteurs
            d'affaires.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apporteurs d'affaires</h1>
          <p className="text-gray-600">Gérez votre réseau d'apporteurs d'affaires</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/providers/create')}
          >
            Nouvel apporteur
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
            placeholder="Rechercher un apporteur..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                  {['Tous', 'Actifs', 'Inactifs'].map(status => (
                    <div key={status} className="flex items-center">
                      <input
                        id={`status-${status}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Performance</label>
                <div className="space-y-2">
                  {['5+ projets', '10+ projets', '20+ projets'].map(perf => (
                    <div key={perf} className="flex items-center">
                      <input
                        id={`perf-${perf}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`perf-${perf}`} className="ml-2 text-sm text-gray-700">
                        {perf}
                      </label>
                    </div>
                  ))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(provider => (
          <BusinessProviderCard key={provider.id} {...provider} />
        ))}
      </div>
    </div>
  );
};

export default BusinessProviderPage;
