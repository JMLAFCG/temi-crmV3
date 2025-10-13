import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  ChevronDown,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '../../store/companyStore';
import { useAuthStore } from '../../store/authStore';

interface CompanyCardProps {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  activities: string[];
  projectCount: number;
  isPartner: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  id,
  name,
  type,
  email,
  phone,
  address,
  activities,
  projectCount,
  isPartner,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            {isPartner && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Partenaire
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{type}</p>
          <div className="mt-3 space-y-1">
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

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Activités:</p>
        <div className="flex flex-wrap gap-2">
          {activities.map((activity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Tag size={12} className="mr-1" />
              {activity}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{projectCount} projets en cours</span>
          <Button variant="outline" size="sm" onClick={() => navigate(`/companies/${id}`)}>
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
};
const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const { companies, loading, fetchCompanies } = useCompanyStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = companies
    .map(company => ({
      id: company.id,
      name: company.name,
      type: company.type,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      activities: company.activities || [],
      projectCount: 0, // À implémenter avec les vraies données
      isPartner: company.status === 'active',
    }))
    .filter(
      company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.activities.some(activity =>
          activity.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
          <p className="text-gray-600">
            {user?.role === 'mandatary'
              ? 'Consultez nos entreprises partenaires et proposez-en de nouvelles'
              : 'Gérez vos entreprises partenaires et fournisseurs'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/companies/create')}
          >
            {user?.role === 'mandatary' ? 'Proposer une Entreprise' : 'Nouvelle Entreprise'}
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
            placeholder="Rechercher entreprises..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="space-y-2">
                  {(user?.role === 'mandatary'
                    ? ['Tous', 'Électricité', 'Plomberie', 'Maçonnerie']
                    : ['Tous', 'Partenaires', 'Fournisseurs']
                  ).map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        id={`type-${type}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {user?.role !== 'mandatary' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activités</label>
                  <div className="space-y-2">
                    {[
                      'Électricité',
                      'Plomberie',
                      'Maçonnerie',
                      'Menuiserie',
                      'Peinture',
                      'Carrelage',
                    ].map(activity => (
                      <div key={activity} className="flex items-center">
                        <input
                          id={`activity-${activity}`}
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`activity-${activity}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {activity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard key={company.id} {...company} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
