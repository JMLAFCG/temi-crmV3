import React from "react";
import { Shield, Users, Building, FileText, Settings, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

const RoleCard: React.FC<{ role: Role; permissions: Permission[] }> = ({ role, permissions }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
        </div>
        <span className="bg-primary-100 text-primary-800 text-xs px-2.5 py-0.5 rounded-full">
          {role.usersCount} utilisateur{role.usersCount > 1 ? 's' : ''}
        </span>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
        <div className="space-y-2">
          {permissions
            .filter(p => role.permissions.includes(p.id))
            .map(permission => (
              <div
                key={permission.id}
                className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded"
              >
                <Shield size={16} className="text-gray-400 mr-2" />
                {permission.name}
              </div>
            ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button variant="outline" fullWidth>
          Modifier les permissions
        </Button>
      </div>
    </div>
  );
};

export const RolesPage: React.FC = () => {
  // Données de démonstration
  const permissions: Permission[] = [
    {
      id: 'users_read',
      name: 'Voir les utilisateurs',
      description: 'Accès en lecture aux utilisateurs',
      module: 'users',
    },
    {
      id: 'users_write',
      name: 'Gérer les utilisateurs',
      description: 'Création et modification des utilisateurs',
      module: 'users',
    },
    {
      id: 'projects_read',
      name: 'Voir les projets',
      description: 'Accès en lecture aux projets',
      module: 'projects',
    },
    {
      id: 'projects_write',
      name: 'Gérer les projets',
      description: 'Création et modification des projets',
      module: 'projects',
    },
    {
      id: 'companies_read',
      name: 'Voir les entreprises',
      description: 'Accès en lecture aux entreprises',
      module: 'companies',
    },
    {
      id: 'companies_write',
      name: 'Gérer les entreprises',
      description: 'Création et modification des entreprises',
      module: 'companies',
    },
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: [
        'users_read',
        'users_write',
        'projects_read',
        'projects_write',
        'companies_read',
        'companies_write',
      ],
      usersCount: 2,
    },
    {
      id: '2',
      name: 'Gestionnaire',
      description: 'Gestion des projets, entreprises et apporteurs',
      permissions: ['projects_read', 'projects_write', 'companies_read', 'companies_write'],
      usersCount: 5,
    },
    {
      id: '3',
      name: 'Commercial',
      description: 'Gestion des projets clients',
      permissions: ['projects_read', 'projects_write'],
      usersCount: 8,
    },
    {
      id: '4',
      name: 'Mandataire',
      description: 'Gestion de portefeuille clients et projets',
      permissions: ['projects_read', 'projects_write', 'companies_read'],
      usersCount: 3,
    },
    {
      id: '5',
      name: "Apporteur d'affaires",
      description: 'Consultation des commissions et apports',
      permissions: ['projects_read'],
      usersCount: 12,
    },
    {
      id: '6',
      name: 'Client',
      description: 'Accès aux projets personnels',
      permissions: ['projects_read'],
      usersCount: 156,
    },
    {
      id: '7',
      name: 'Entreprise partenaire',
      description: 'Accès aux projets assignés et gestion des devis',
      permissions: ['projects_read', 'projects_write'],
      usersCount: 42,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rôles et permissions</h1>
          <p className="text-gray-600">Gérez les rôles et leurs permissions associées</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Modules et permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="text-primary-600 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Utilisateurs</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Voir les utilisateurs</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Gérer les utilisateurs</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Building className="text-primary-600 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Entreprises</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Voir les entreprises</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Gérer les entreprises</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="text-primary-600 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Voir les documents</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Gérer les documents</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Calendar className="text-primary-600 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Calendrier</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Voir les événements</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Gérer les événements</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <MessageSquare className="text-primary-600 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Messages</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Voir les messages</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Envoyer des messages</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="text-primary-600 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Paramètres</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Voir les paramètres</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Modifier les paramètres</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Rôles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <RoleCard key={role.id} role={role} permissions={permissions} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
