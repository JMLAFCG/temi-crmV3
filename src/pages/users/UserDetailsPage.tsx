import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Building,
  Users as UsersIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { UserDashboardViewer } from '../../components/users/UserDashboardViewer';
import { supabase } from '../../lib/supabase';

// Fonction pour valider si une chaîne est un UUID valide
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

interface UserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  status: 'active' | 'inactive';
}
const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

      if (error) throw error;
      setUserDetails(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails utilisateur:', err);
      setError('Utilisateur non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userDetails || !window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const { error } = await supabase.from('users').delete().eq('id', userDetails.id);

      if (error) throw error;
      navigate('/settings/users');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Vérification des permissions
  const canViewUserDetails =
    currentUser && ['mandatary', 'commercial', 'manager', 'admin'].includes(currentUser.role);

  const canViewUserDashboard =
    userDetails && ['client', 'entreprise_partenaire', 'apporteur'].includes(userDetails.role);

  if (!canViewUserDetails) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">
            Vous n'avez pas les permissions pour voir les détails des utilisateurs.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Utilisateur non trouvé'}</p>
        <Button variant="outline" onClick={() => navigate('/settings/users')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  if (showDashboard && canViewUserDashboard) {
    return (
      <UserDashboardViewer
        userId={userDetails.id}
        userRole={userDetails.role}
        userName={`${userDetails.first_name} ${userDetails.last_name}`}
        onClose={() => setShowDashboard(false)}
      />
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <User className="text-blue-600" size={20} />;
      case 'entreprise_partenaire':
        return <Building className="text-green-600" size={20} />;
      case 'apporteur':
        return <UsersIcon className="text-purple-600" size={20} />;
      case 'mandatary':
        return <Shield className="text-orange-600" size={20} />;
      case 'commercial':
        return <Shield className="text-blue-600" size={20} />;
      case 'manager':
        return <Shield className="text-red-600" size={20} />;
      case 'admin':
        return <Shield className="text-gray-600" size={20} />;
      default:
        return <User className="text-gray-600" size={20} />;
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      client: 'Client',
      entreprise_partenaire: 'Entreprise Partenaire',
      apporteur: "Apporteur d'affaires",
      mandatary: 'Mandataire',
      commercial: 'Commercial',
      manager: 'Gestionnaire',
      admin: 'Administrateur',
    };
    return labels[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/settings/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux utilisateurs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userDetails.first_name} {userDetails.last_name}
                </h1>
                <div className="ml-3 flex items-center px-3 py-1 rounded-full bg-gray-100">
                  {getRoleIcon(userDetails.role)}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {getRoleLabel(userDetails.role)}
                  </span>
                </div>
              </div>
              <p className="text-gray-600">{userDetails.email}</p>
            </div>

            <div className="flex gap-3">
              {canViewUserDashboard && (
                <Button
                  variant="primary"
                  leftIcon={<Eye size={16} />}
                  onClick={() => setShowDashboard(true)}
                >
                  Voir son espace
                </Button>
              )}

              <Button
                variant="outline"
                leftIcon={<Edit size={16} />}
                onClick={() => navigate(`/settings/users/${userDetails.id}/edit`)}
              >
                Modifier
              </Button>

              {currentUser?.role === 'admin' && (
                <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={handleDeleteUser}>
                  Supprimer
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations personnelles
                </h2>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-600">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    {userDetails.email}
                  </p>
                  {userDetails.phone && (
                    <p className="flex items-center text-gray-600">
                      <Phone size={18} className="text-gray-400 mr-2" />
                      {userDetails.phone}
                    </p>
                  )}
                  {userDetails.address && (
                    <p className="flex items-center text-gray-600">
                      <MapPin size={18} className="text-gray-400 mr-2" />
                      {userDetails.address}
                    </p>
                  )}
                  <p className="flex items-center text-gray-600">
                    <Calendar size={18} className="text-gray-400 mr-2" />
                    Créé le {new Date(userDetails.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {userDetails.last_login && (
                    <p className="flex items-center text-gray-600">
                      <Calendar size={18} className="text-gray-400 mr-2" />
                      Dernière connexion :{' '}
                      {new Date(userDetails.last_login).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userDetails.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {userDetails.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h2>
                <div className="space-y-3">
                  {canViewUserDashboard && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-blue-900">Visualiser son espace</h3>
                          <p className="text-sm text-blue-700">
                            Accéder à son tableau de bord{' '}
                            {getRoleLabel(userDetails.role).toLowerCase()}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Eye size={16} />}
                          onClick={() => setShowDashboard(true)}
                        >
                          Voir
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Modifier les informations</h3>
                        <p className="text-sm text-gray-600">Éditer le profil et les permissions</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit size={16} />}
                        onClick={() => navigate(`/settings/users/${userDetails.id}/edit`)}
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>

                  {userDetails.role === 'client' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-green-900">Créer un projet</h3>
                          <p className="text-sm text-green-700">
                            Créer un nouveau projet pour ce client
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/projects/create?client_id=${userDetails.id}`)}
                        >
                          Nouveau projet
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Projets</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {userDetails.role === 'client'
                        ? '3'
                        : userDetails.role === 'entreprise_partenaire'
                          ? '12'
                          : userDetails.role === 'apporteur'
                            ? '8'
                            : '0'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      {userDetails.role === 'client'
                        ? 'Documents'
                        : userDetails.role === 'entreprise_partenaire'
                          ? 'Missions'
                          : userDetails.role === 'apporteur'
                            ? 'Commissions'
                            : 'Activité'}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {userDetails.role === 'client'
                        ? '7'
                        : userDetails.role === 'entreprise_partenaire'
                          ? '5'
                          : userDetails.role === 'apporteur'
                            ? '2.4k€'
                            : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
