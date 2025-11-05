import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, ChevronDown, User, Mail, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useUserStore } from '../../store/userStore';

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

  const { users: storeUsers, loading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const users: UserCardProps[] = storeUsers.map(user => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    lastLogin: user.last_login,
    status: user.status,
  }));

  if (loading && storeUsers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Chargement des utilisateurs...</div>
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier utilisateur pour gérer votre équipe.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/admin/users/create')}
          >
            Créer un utilisateur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <UserCard key={user.id} {...user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
