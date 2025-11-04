import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, User, Building, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import ClientDashboard from '../../pages/dashboard/ClientDashboard';
import EntrepriseDashboard from '../../pages/dashboard/EntrepriseDashboard';
import ApporteurDashboard from '../../pages/dashboard/ApporteurDashboard';
import { supabase } from '../../lib/supabase';


export const UserDashboardViewer: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      setUserData(data);

      // Temporairement remplacer l'utilisateur dans le store pour la visualisation
      const tempUser = {
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
      };

      // Injecter temporairement l'utilisateur visualisé
      (window as any).__tempViewUser = tempUser;
    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      setError("Impossible de charger les données de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Restaurer l'utilisateur original
    (window as any).__tempViewUser = null;
    navigate('/clients');
  };
  // Vérification des permissions
  const canViewUserDashboard =
    currentUser && ['mandatary', 'commercial', 'manager', 'admin'].includes(currentUser.role);

  if (!canViewUserDashboard) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">
            Vous n'avez pas les permissions pour visualiser cet espace utilisateur.
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-800 mb-2">Erreur</h2>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={handleClose} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <User className="text-blue-600" size={24} />;
      case 'entreprise_partenaire':
        return <Building className="text-green-600" size={24} />;
      case 'apporteur':
        return <Users className="text-purple-600" size={24} />;
      default:
        return <User className="text-gray-600" size={24} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client':
        return 'Client';
      case 'entreprise_partenaire':
        return 'Entreprise Partenaire';
      case 'apporteur':
        return "Apporteur d'affaires";
      default:
        return role;
    }
  };

  const renderUserDashboard = () => {
    switch (userData?.role) {
      case 'client':
        return (
          <div className="relative">
            <ClientDashboard />
            {/* Overlay pour indiquer qu'on visualise un autre utilisateur */}
            <div className="absolute top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">
                👁️ Vue client de {userData?.first_name} {userData?.last_name}
              </p>
            </div>
          </div>
        );

      case 'entreprise_partenaire':
        return (
          <div className="relative">
            <EntrepriseDashboard />
            <div className="absolute top-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">
                👁️ Vue entreprise de {userData?.first_name} {userData?.last_name}
              </p>
            </div>
          </div>
        );

      case 'apporteur':
        return (
          <div className="relative">
            <ApporteurDashboard />
            <div className="absolute top-4 right-4 bg-purple-100 border border-purple-300 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-800">
                👁️ Vue apporteur de {userData?.first_name} {userData?.last_name}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Aucun dashboard spécifique pour le rôle : {getRoleLabel(userData?.role || '')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec informations utilisateur */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={handleClose}>
              Retour
            </Button>

            <div className="flex items-center space-x-3">
              {getRoleIcon(userData?.role || '')}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Espace {getRoleLabel(userData?.role || '')} - {userData?.first_name}{' '}
                  {userData?.last_name}
                </h1>
                <p className="text-sm text-gray-600">
                  Visualisation en tant qu'administrateur TÉMI
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
              <Eye size={12} className="inline mr-1" />
              Mode visualisation
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu du dashboard utilisateur */}
      <div className="relative">{renderUserDashboard()}</div>
    </div>
  );
};

export default UserDashboardViewer;
