import React, { useState } from 'react';
import { Plus, Filter, Search, ChevronDown, User, Mail, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

interface UserCardProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

const UserCard: React.FC<UserCardProps> = ({
  id,
  firstName,
  lastName,
  email,
  role,
  lastLogin,
  status,
}) => {
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrateur',
    gestionnaire: 'Gestionnaire',
    commercial: 'Commercial',
    mandataire: 'Mandataire',
    apporteur: "Apporteur d'affaires",
    client: 'Client',
    partner_company: 'Entreprise partenaire',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {firstName} {lastName}
            </h3>
            <span
              className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" />
              {email}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Shield size={16} className="mr-2 text-gray-400" />
              {roleLabels[role]}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {lastLogin
              ? `Dernière connexion : ${new Date(lastLogin).toLocaleDateString()}`
              : 'Jamais connecté'}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${id}`)}>
            Gérer
          </Button>
        </div>
      </div>
    </div>
  );
};
const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Données de démonstration
  const users: UserCardProps[] = [
    {
      id: '1',
      firstName: 'Thomas',
      lastName: 'Durand',
      email: 'thomas.durand@example.com',
      role: 'admin',
      lastLogin: '2025-05-10T10:30:00',
      status: 'active',
    },
    {
      id: '2',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@example.com',
      role: 'manager',
      lastLogin: '2025-05-09T15:45:00',
      status: 'active',
    },
    {
      id: '3',
      firstName: 'Jean',
      lastName: 'Petit',
      email: 'jean.petit@example.com',
      role: 'commercial',
      lastLogin: '2025-05-08T09:15:00',
      status: 'active',
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/admin/users/create')}
          >
            Nouvel utilisateur
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
            placeholder="Rechercher un utilisateur..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <div className="space-y-2">
                  {[
                    'Tous',
                    'Administrateurs',
                    'Gestionnaires',
                    'Commerciaux',
                    'Mandataires',
                    'Apporteurs',
                    'Clients',
                  ].map(role => (
                    <div key={role} className="flex items-center">
                      <input
                        id={`role-${role}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`role-${role}`} className="ml-2 text-sm text-gray-700">
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <div className="space-y-2">
                  {['Actifs', 'Inactifs'].map(status => (
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
        {users.map(user => (
          <UserCard key={user.id} {...user} />
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
