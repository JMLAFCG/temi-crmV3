import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  TrendingUp,
  Euro,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Target,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Apport } from '../../types';
import { Logo } from '../../components/ui/Logo';
const ApporteurDashboard: React.FC = () => {
  const { user, getViewUser } = useAuthStore();

  // Utiliser l'utilisateur visualisé si disponible, sinon l'utilisateur connecté
  const currentUser = getViewUser() || user;

  const [apports, setApports] = useState<Apport[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApportForm, setShowApportForm] = useState(false);
  const [submittingApport, setSubmittingApport] = useState(false);

  const [formData, setFormData] = useState({
    prospect_nom: '',
    prospect_prenom: '',
    prospect_email: '',
    prospect_telephone: '',
    prospect_adresse: '',
    type_projet: '',
    description_projet: '',
    budget_estime: 0,
    commentaire: '',
  });

  useEffect(() => {
    if (currentUser) {
      fetchApporteurData();
    }
  }, [currentUser]);

  const fetchApporteurData = async () => {
    try {
      setLoading(true);

      // Récupérer les apports
      const { data: apportsData, error: apportsError } = await supabase
        .from('apports')
        .select('*')
        .eq('apporteur_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (apportsError) throw apportsError;

      // Récupérer les commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('provider_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      setApports(apportsData || []);
      setCommissions(commissionsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données apporteur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmittingApport(true);
    try {
      const { error } = await supabase.from('apports').insert({
        apporteur_id: currentUser.id,
        ...formData,
        date_contact: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      // Réinitialiser le formulaire
      setFormData({
        prospect_nom: '',
        prospect_prenom: '',
        prospect_email: '',
        prospect_telephone: '',
        prospect_adresse: '',
        type_projet: '',
        description_projet: '',
        budget_estime: 0,
        commentaire: '',
      });

      setShowApportForm(false);
      await fetchApporteurData();
    } catch (error) {
      console.error("Erreur lors de la soumission de l'apport:", error);
    } finally {
      setSubmittingApport(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'réalisé':
      case 'payé':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'en_cours':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'en_attente':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'refusé':
      case 'abandonné':
      case 'annulé':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'réalisé':
      case 'payé':
        return <CheckCircle size={16} />;
      case 'en_cours':
        return <Clock size={16} />;
      case 'en_attente':
        return <AlertTriangle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalCommissions = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  const commissionsEnAttente = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);
  const apportsRealises = apports.filter(a => a.statut === 'réalisé').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 -m-6 p-6">
      {/* Logo discret en haut à droite */}
      <div className="absolute top-4 right-4 z-10">
        <Logo size="sm" variant="full" className="opacity-60" />
      </div>

      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Espace Apporteur d'Affaires 🎯
              </h1>
              <p className="text-gray-600 text-lg">Gérez vos apports et commissions</p>
              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-purple-600">{apports.length}</span>
                  <span className="ml-2 text-gray-600">apports soumis</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-600">{apportsRealises}</span>
                  <span className="ml-2 text-gray-600">réalisés</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {totalCommissions.toLocaleString()}€
                  </span>
                  <span className="ml-2 text-gray-600">gagnés</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-purple-100 rounded-full p-4">
                <Users size={32} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bouton nouveau prospect */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="text-center">
              <Target size={48} className="mx-auto text-purple-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Nouveau prospect</h2>
              <p className="text-gray-600 mb-6">
                Soumettez un nouveau prospect pour gagner des commissions
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setShowApportForm(true)}
              >
                Soumettre un apport
              </Button>
            </div>
          </div>

          {/* Historique des apports */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Mes apports</h2>
              <p className="text-gray-600">Historique de vos prospects soumis</p>
            </div>
            <div className="p-6">
              {apports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun apport soumis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apports.map(apport => (
                    <div
                      key={apport.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {apport.prospect_prenom} {apport.prospect_nom}
                          </h3>
                          <p className="text-sm text-gray-600">{apport.type_projet}</p>
                          <p className="text-sm text-gray-500">{apport.description_projet}</p>
                          {apport.prospect_email && (
                            <p className="text-sm text-gray-500 mt-1">{apport.prospect_email}</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(apport.statut)}`}
                        >
                          {getStatusIcon(apport.statut)}
                          <span className="ml-2 capitalize">{apport.statut.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Budget estimé: {apport.budget_estime.toLocaleString()}€</span>
                        <span>Soumis le {new Date(apport.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-8">
          {/* Mes commissions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Mes commissions</h2>
              <p className="text-gray-600">Rétributions gagnées</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Total gagné</p>
                      <p className="text-2xl font-bold text-green-900">
                        {totalCommissions.toLocaleString()}€
                      </p>
                    </div>
                    <Euro className="text-green-600" size={32} />
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700">En attente</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {commissionsEnAttente.toLocaleString()}€
                      </p>
                    </div>
                    <Clock className="text-yellow-600" size={32} />
                  </div>
                </div>
              </div>

              {commissions.length === 0 ? (
                <div className="text-center py-4">
                  <Euro size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Aucune commission</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.slice(0, 5).map(commission => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {commission.amount.toLocaleString()}€
                        </p>
                        <p className="text-xs text-gray-500">
                          {commission.rate}% -{' '}
                          {new Date(commission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}
                      >
                        {getStatusIcon(commission.status)}
                        <span className="ml-1">{commission.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <p className="text-gray-600">Mises à jour</p>
            </div>
            <div className="p-6">
              {apports.filter(a => a.statut === 'réalisé').length === 0 ? (
                <div className="text-center py-4">
                  <TrendingUp size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apports
                    .filter(a => a.statut === 'réalisé')
                    .slice(0, 3)
                    .map(apport => (
                      <div
                        key={apport.id}
                        className="p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center">
                          <CheckCircle className="text-green-600 mr-2" size={16} />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              Apport concrétisé !
                            </p>
                            <p className="text-xs text-green-700">
                              {apport.prospect_nom} - {apport.budget_estime.toLocaleString()}€
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal formulaire d'apport */}
      {showApportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Soumettre un nouveau prospect
            </h3>
            <form onSubmit={handleSubmitApport} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom du prospect"
                  value={formData.prospect_nom}
                  onChange={e => setFormData({ ...formData, prospect_nom: e.target.value })}
                  required
                />
                <Input
                  label="Prénom du prospect"
                  value={formData.prospect_prenom}
                  onChange={e => setFormData({ ...formData, prospect_prenom: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.prospect_email}
                  onChange={e => setFormData({ ...formData, prospect_email: e.target.value })}
                />
                <Input
                  label="Téléphone"
                  value={formData.prospect_telephone}
                  onChange={e => setFormData({ ...formData, prospect_telephone: e.target.value })}
                />
              </div>

              <Input
                label="Adresse du projet"
                value={formData.prospect_adresse}
                onChange={e => setFormData({ ...formData, prospect_adresse: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de projet
                  </label>
                  <select
                    value={formData.type_projet}
                    onChange={e => setFormData({ ...formData, type_projet: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Rénovation">Rénovation</option>
                    <option value="Extension">Extension</option>
                    <option value="Construction">Construction neuve</option>
                    <option value="Aménagement">Aménagement</option>
                  </select>
                </div>
                <Input
                  label="Budget estimé (€)"
                  type="number"
                  value={formData.budget_estime}
                  onChange={e =>
                    setFormData({ ...formData, budget_estime: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description du projet
                </label>
                <textarea
                  value={formData.description_projet}
                  onChange={e => setFormData({ ...formData, description_projet: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Décrivez le projet du prospect..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
                <textarea
                  value={formData.commentaire}
                  onChange={e => setFormData({ ...formData, commentaire: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Informations complémentaires..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApportForm(false)}
                  disabled={submittingApport}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" isLoading={submittingApport}>
                  Soumettre l'apport
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApporteurDashboard;
