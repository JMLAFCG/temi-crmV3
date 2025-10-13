import React, { useState } from 'react';
import { Plus, Search, Filter, ChevronDown, Mail, Phone, Shield, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}
const UserSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Données de démonstration
  const users: User[] = [
    {
      id: '1',
      firstName: 'Thomas',
      lastName: 'Durand',
      email: 'thomas.durand@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-05-10T10:30:00',
    },
    {
      id: '2',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2025-05-09T15:45:00',
    },
    {
      id: '3',
      firstName: 'Jean',
      lastName: 'Petit',
      email: 'jean.petit@example.com',
      role: 'commercial',
      status: 'active',
      lastLogin: '2025-05-08T09:15:00',
    },
  ];

  const handleCreateUser = async (data: any) => {
    // Logique de création d'utilisateur
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h2>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setShowCreateForm(true)}
            >
              Nouvel utilisateur
            </Button>
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
                        'Entreprises partenaires',
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
                          <label
                            htmlFor={`status-${status}`}
                            className="ml-2 text-sm text-gray-700"
                          >
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Utilisateur
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rôle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dernière connexion
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.firstName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={() => navigate(`/settings/users/${user.id}`)}
                        >
                          Voir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvel utilisateur</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCreateUser({});
              }}
            >
              <div className="space-y-4">
                <Input label="Prénom" required />
                <Input label="Nom" required />
                <Input label="Email" type="email" required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                    <option value="commercial">Commercial</option>
                    <option value="manager">Gestionnaire</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  Créer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettingsPage;
