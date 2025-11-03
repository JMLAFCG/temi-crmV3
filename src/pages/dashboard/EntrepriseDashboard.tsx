import React, { useState, useEffect } from 'react';
import {
  Building,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Euro,
  Download,
  Upload,
  Calendar,
  Award,
  Brain,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Mission, Paiement, Document } from '../../types';
import { Logo } from '../../components/ui/Logo';
import { useAIQuoteStore } from '../../store/aiQuoteStore';
import { EnterpriseNegotiationPanel } from '../../components/ai/EnterpriseNegotiationPanel';
import { env } from '../../config/env';

const EntrepriseDashboard = () => {
  const { user, getViewUser } = useAuthStore();

  // Utiliser l'utilisateur visualisé si disponible, sinon l'utilisateur connecté
  const currentUser = getViewUser() || user;

  const { processQuoteWithAI } = useAIQuoteStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [documentsLegaux, setDocumentsLegaux] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingQuote, setUploadingQuote] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchEntrepriseData();
    }
  }, [currentUser]);

  const fetchEntrepriseData = async () => {
    try {
      setLoading(true);

      // Récupérer les projets assignés à cette entreprise
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .or(`business_providers.cs.{${currentUser?.id}}`)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Erreur projets:', projectsError);
      }

      // Récupérer les commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('provider_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (commissionsError) {
        console.error('Erreur commissions:', commissionsError);
      }

      // Récupérer les documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', currentUser?.id)
        .order('created_at', { ascending: false});

      if (docsError) throw docsError;

      // Adapter les données pour correspondre aux types existants
      const adaptedMissions = (projectsData || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        amount: project.amount,
        location: project.location,
        created_at: project.created_at,
        statut:
          project.status === 'completed'
            ? 'terminé'
            : project.status === 'in_progress'
              ? 'en_cours'
              : project.status === 'pending'
                ? 'proposé'
                : 'en_attente',
        montant_devis: project.amount || 0,
        date_affectation: project.created_at,
        updated_at: project.updated_at,
      }));

      const adaptedPaiements = (commissionsData || []).map(commission => ({
        id: commission.id,
        montant: commission.amount || 0,
        statut:
          commission.status === 'paid'
            ? 'payé'
            : commission.status === 'validated'
              ? 'validé'
              : 'en_attente',
        type_paiement: 'commission',
        created_at: commission.created_at,
      }));

      const adaptedDocuments = (docsData || []).map(doc => ({
        id: doc.id,
        nom_fichier: doc.name,
        type_document: 'autre',
        statut: 'en_attente',
        created_at: doc.created_at,
      }));

      setMissions(adaptedMissions);
      setPaiements(adaptedPaiements);
      setDocumentsLegaux(adaptedDocuments);
    } catch (error) {
      console.error('Erreur lors du chargement des données entreprise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (error) throw error;
      await fetchEntrepriseData();
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la mission:", error);
    }
  };

  const handleDocumentUpload = async (file: File, typeDocument: string) => {
    if (!currentUser) return;

    setUploadingDoc(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const fileUrl = URL.createObjectURL(file);

      const { error } = await supabase.from('documents').insert({
        uploaded_by: currentUser.id,
        name: fileName,
        file_path: fileUrl,
      });

      if (error) throw error;
      await fetchEntrepriseData();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleQuoteUpload = async (file: File, missionId: string, projetId: string) => {
    if (!currentUser) return;

    setUploadingQuote(true);
    try {
      // 1. Upload du devis
      const fileName = `devis_${Date.now()}_${file.name}`;
      const fileUrl = URL.createObjectURL(file);

      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          project_id: projetId,
          uploaded_by: currentUser.id,
          name: fileName,
          file_path: fileUrl,
        })
        .select()
        .single();

      if (docError) throw docError;

      // 2. Lancer le traitement IA automatiquement
      try {
        await processQuoteWithAI(document.id, projetId);
        console.log('✅ Devis traité par IA avec succès');
      } catch (aiError) {
        console.warn('⚠️ Erreur traitement IA, mais devis uploadé:', aiError);
      }

      await fetchEntrepriseData();
    } catch (error) {
      console.error('Erreur lors du téléchargement du devis:', error);
    } finally {
      setUploadingQuote(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'completed':
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'draft':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'completed':
      case 'paid':
        return <CheckCircle size={16} />;
      case 'in_progress':
      case 'pending':
        return <Clock size={16} />;
      case 'draft':
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

  const missionsEnCours = missions.filter(m => ['in_progress', 'pending'].includes(m.status));
  const totalPaiements = paiements
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const paiementsEnAttente = paiements
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 -m-6 p-6">
      {/* Logo discret en haut à droite */}
      <div className="absolute top-4 right-4 z-10">
        <Logo size="sm" variant="full" className="opacity-60" />
      </div>

      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Espace Entreprise Partenaire 🏢
              </h1>
              <p className="text-gray-600 text-lg">Gérez vos missions et documents</p>
              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-600">
                    {missionsEnCours.length}
                  </span>
                  <span className="ml-2 text-gray-600">missions actives</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPaiements.toLocaleString()}€
                  </span>
                  <span className="ml-2 text-gray-600">reçus</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-100 rounded-full p-4">
                <Building size={32} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mes missions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Mes missions</h2>
              <p className="text-gray-600">Projets qui vous sont assignés</p>
            </div>
            <div className="p-6">
              {missions.length === 0 ? (
                <div className="text-center py-8">
                  <Building size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucune mission assignée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {missions.map(mission => (
                    <div
                      key={mission.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {mission.title || 'Projet sans titre'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {mission.description || 'Aucune description'}
                          </p>
                          {mission.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              {typeof mission.location === 'object'
                                ? (mission.location as any).address
                                : mission.location}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(mission.status)}`}
                        >
                          {getStatusIcon(mission.status)}
                          <span className="ml-2 capitalize">{mission.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <span>Budget: {mission.amount?.toLocaleString() || 0}€</span>
                          <span className="ml-4">
                            Créé le {new Date(mission.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {mission.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                /* Refuser */
                              }}
                            >
                              Refuser
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAcceptMission(mission.id)}
                            >
                              Accepter
                            </Button>
                          </div>
                        ) : (
                          mission.status === 'in_progress' && (
                            <div className="flex flex-col space-y-2">
                              <input
                                type="file"
                                id={`quote-upload-${mission.id}`}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleQuoteUpload(file, mission.id, mission.id);
                                  }
                                }}
                                disabled={uploadingQuote}
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Brain size={14} />}
                                onClick={() =>
                                  document.getElementById(`quote-upload-${mission.id}`)?.click()
                                }
                                isLoading={uploadingQuote}
                              >
                                Soumettre devis IA
                              </Button>
                              <p className="text-xs text-gray-500 text-center">
                                L'IA analysera automatiquement votre devis
                              </p>

                              {/* Statut de négociation */}
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs text-blue-700">
                                  💬 Négociation possible avec TÉMI après analyse
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bloc IA - Mes devis analysés */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center">
                <Brain className="text-purple-600 mr-3" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mes Devis IA</h2>
                  <p className="text-gray-600">Devis analysés par intelligence artificielle</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  Vos prochains devis seront automatiquement analysés par IA
                </p>
              </div>
            </div>
          </div>

          {/* Documents légaux */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Documents légaux</h2>
              <p className="text-gray-600">RC Pro, Kbis, RIB et autres documents</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {['rc_pro', 'kbis', 'rib', 'decennale'].map(type => {
                  const doc = documentsLegaux.find(d => d.type_document === type);
                  const typeLabels = {
                    rc_pro: 'RC Professionnelle',
                    kbis: 'Extrait Kbis',
                    rib: 'RIB',
                    decennale: 'Assurance Décennale',
                  };

                  return (
                    <div key={type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">
                          {typeLabels[type as keyof typeof typeLabels]}
                        </h4>
                        {doc && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.statut)}`}
                          >
                            {getStatusIcon(doc.statut)}
                            <span className="ml-1">{doc.statut}</span>
                          </span>
                        )}
                      </div>
                      {doc ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">{doc.nom_fichier}</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download size={14} className="mr-1" />
                              Télécharger
                            </Button>
                            <Button variant="outline" size="sm">
                              Remplacer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id={`upload-${type}`}
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleDocumentUpload(file, type);
                              }
                            }}
                            disabled={uploadingDoc}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => document.getElementById(`upload-${type}`)?.click()}
                            isLoading={uploadingDoc}
                            leftIcon={<Upload size={14} />}
                          >
                            Télécharger
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-8">
          {/* Négociations TÉMI */}
          <EnterpriseNegotiationPanel entrepriseId={user?.id || ''} />

          {/* Mes rétrocessions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Mes rétrocessions</h2>
              <p className="text-gray-600">Paiements reçus</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Total reçu</p>
                      <p className="text-2xl font-bold text-green-900">
                        {totalPaiements.toLocaleString()}€
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
                        {paiementsEnAttente.toLocaleString()}€
                      </p>
                    </div>
                    <Clock className="text-yellow-600" size={32} />
                  </div>
                </div>
              </div>

              {paiements.length === 0 ? (
                <div className="text-center py-4">
                  <Euro size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Aucun paiement</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paiements.slice(0, 5).map(paiement => (
                    <div
                      key={paiement.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {paiement.montant.toLocaleString()}€
                        </p>
                        <p className="text-xs text-gray-500">
                          {paiement.type_paiement} -{' '}
                          {new Date(paiement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paiement.statut)}`}
                      >
                        {getStatusIcon(paiement.statut)}
                        <span className="ml-1">{paiement.statut}</span>
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
              <p className="text-gray-600">Nouvelles missions</p>
            </div>
            <div className="p-6">
              {missions.filter(m => m.statut === 'proposé').length === 0 ? (
                <div className="text-center py-4">
                  <Calendar size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Aucune nouvelle mission</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missions
                    .filter(m => m.statut === 'proposé')
                    .map(mission => (
                      <div
                        key={mission.id}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center">
                          <Award className="text-blue-600 mr-2" size={16} />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              Nouvelle mission proposée
                            </p>
                            <p className="text-xs text-blue-700">
                              {(mission as any).projet?.titre || 'Projet'} -{' '}
                              {mission.montant_devis.toLocaleString()}€
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Statut des documents */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Statut documents</h2>
              <p className="text-gray-600">Conformité légale</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {['rc_pro', 'kbis', 'rib', 'decennale'].map(type => {
                  const doc = documentsLegaux.find(d => d.type_document === type);
                  const typeLabels = {
                    rc_pro: 'RC Pro',
                    kbis: 'Kbis',
                    rib: 'RIB',
                    decennale: 'Décennale',
                  };

                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {typeLabels[type as keyof typeof typeLabels]}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc
                            ? getStatusColor(doc.statut)
                            : 'text-gray-600 bg-gray-50 border-gray-200'
                        }`}
                      >
                        {doc ? doc.statut : 'manquant'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepriseDashboard;
