import React, { useState } from 'react';
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
const RoleSettingsPage: React.FC = () => {
  // Données de démonstration
  const permissions: Permission[] = [
    {
      id: 'view_own_profile',
      name: 'Voir son profil',
      description: 'Accès à son propre profil',
      module: 'users',
    },
    {
      id: 'update_own_profile',
      name: 'Modifier son profil',
      description: 'Modification de son profil',
      module: 'users',
    },
    {
      id: 'view_all_profiles',
      name: 'Voir tous les profils',
      description: 'Accès à tous les profils utilisateurs',
      module: 'users',
    },
    {
      id: 'create_users',
      name: 'Créer des utilisateurs',
      description: 'Création de nouveaux utilisateurs',
      module: 'users',
    },
    {
      id: 'update_users',
      name: 'Modifier les utilisateurs',
      description: 'Modification des utilisateurs',
      module: 'users',
    },
    {
      id: 'view_own_projects',
      name: 'Voir ses projets',
      description: 'Accès à ses propres projets',
      module: 'projects',
    },
    {
      id: 'view_portfolio_projects',
      name: 'Voir projets portefeuille',
      description: 'Accès aux projets de son portefeuille',
      module: 'projects',
    },
    {
      id: 'view_all_projects',
      name: 'Voir tous les projets',
      description: 'Accès à tous les projets',
      module: 'projects',
    },
    {
      id: 'create_projects',
      name: 'Créer des projets',
      description: 'Création de nouveaux projets',
      module: 'projects',
    },
    {
      id: 'view_assigned_projects',
      name: 'Voir projets assignés',
      description: 'Accès aux projets assignés',
      module: 'projects',
    },
    {
      id: 'submit_quotes',
      name: 'Soumettre des devis',
      description: 'Soumission de devis',
      module: 'projects',
    },
    {
      id: 'view_verified_companies',
      name: 'Voir entreprises vérifiées',
      description: 'Accès aux entreprises vérifiées',
      module: 'companies',
    },
    {
      id: 'view_all_companies',
      name: 'Voir toutes les entreprises',
      description: 'Accès à toutes les entreprises',
      module: 'companies',
    },
    {
      id: 'validate_companies',
      name: 'Valider les entreprises',
      description: 'Validation des entreprises',
      module: 'companies',
    },
    {
      id: 'view_own_commissions',
      name: 'Voir ses commissions',
      description: 'Accès à ses propres commissions',
      module: 'commissions',
    },
    {
      id: 'view_all_commissions',
      name: 'Voir toutes les commissions',
      description: 'Accès à toutes les commissions',
      module: 'commissions',
    },
    {
      id: 'view_own_statistics',
      name: 'Voir ses statistiques',
      description: 'Accès à ses propres statistiques',
      module: 'analytics',
    },
    {
      id: 'view_all_statistics',
      name: 'Voir toutes les statistiques',
      description: 'Accès à toutes les statistiques',
      module: 'analytics',
    },
    {
      id: 'global_configuration',
      name: 'Configuration globale',
      description: 'Accès à la configuration système',
      module: 'settings',
    },
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: [
        'view_all_profiles',
        'create_users',
        'update_users',
        'view_all_projects',
        'create_projects',
        'view_all_companies',
        'validate_companies',
        'view_all_commissions',
        'view_all_statistics',
        'global_configuration',
      ],
      usersCount: 2,
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Gestion des projets et des entreprises',
      permissions: [
        'view_all_profiles',
        'view_all_projects',
        'create_projects',
        'view_all_companies',
        'validate_companies',
        'view_all_commissions',
      ],
      usersCount: 5,
    },
    {
      id: '3',
      name: 'Commercial',
      description: 'Gestion des projets clients',
      permissions: [
        'view_own_profile',
        'update_own_profile',
        'view_portfolio_projects',
        'create_projects',
        'view_verified_companies',
        'view_own_commissions',
      ],
      usersCount: 8,
    },
    {
      id: '4',
      name: 'Mandataire',
      description: 'Gestion de portefeuille clients et projets',
      permissions: [
        'view_own_profile',
        'update_own_profile',
        'view_portfolio_projects',
        'create_projects',
        'view_verified_companies',
        'view_own_commissions',
      ],
      usersCount: 3,
    },
    {
      id: '5',
      name: "Apporteur d'affaires",
      description: 'Consultation des commissions et apports',
      permissions: ['view_own_profile', 'update_own_profile', 'view_own_commissions'],
      usersCount: 12,
    },
    {
      id: '6',
      name: 'Client',
      description: 'Accès aux projets personnels',
      permissions: ['view_own_profile', 'update_own_profile', 'view_own_projects'],
      usersCount: 156,
    },
    {
      id: '7',
      name: 'Entreprise partenaire',
      description: 'Accès aux projets assignés et gestion des devis',
      permissions: [
        'view_own_profile',
        'update_own_profile',
        'view_assigned_projects',
        'submit_quotes',
        'view_own_statistics',
      ],
      usersCount: 42,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Rôles et permissions</h2>

          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">Modules et permissions</h3>
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
      </div>
    </div>
  );
};

export default RoleSettingsPage;
