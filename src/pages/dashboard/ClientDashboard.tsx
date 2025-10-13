import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  PenTool,
  Calendar,
  User,
  Zap,
  Brain,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Projet, Document, Signature, JournalClient } from '../../types';
import { SignaturePad } from '../../components/projects/SignaturePad';
import { PropositionGlobaleViewer } from '../../components/ai/PropositionGlobaleViewer';
import { AIQuoteProcessor } from '../../components/ai/AIQuoteProcessor';
import { Logo } from '../../components/ui/Logo';
import { useAIQuoteStore } from '../../store/aiQuoteStore';

const ClientDashboard = () => {
  const { user, getViewUser } = useAuthStore();

  // Utiliser l'utilisateur visualisé si disponible, sinon l'utilisateur connecté
  const currentUser = getViewUser() || user;

  const {
    propositions,
    fetchPropositions,
    validateProposition,
    requestModification,
    signProposition,
  } = useAIQuoteStore();
  const [projets, setProjets] = useState<Projet[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [journal, setJournal] = useState<JournalClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_proposal'>('overview');

  useEffect(() => {
    if (currentUser) {
      fetchClientData();
      fetchPropositions();
    }
  }, [currentUser, fetchPropositions]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Utiliser des données mock pour éviter les erreurs de base de données
      const mockProjets = [
        {
          id: 'project-1',
          title: 'Rénovation maison familiale',
          description: "Rénovation complète d'une maison de 120m²",
          status: 'in_progress' as const,
          client_id: currentUser?.id,
          agent_id: 'agent-1',
          location: { address: '123 Rue de la Paix, 75001 Paris' },
          budget: { min: 40000, max: 50000 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockDocuments = [
        {
          id: 'doc-1',
          nom_fichier: 'Devis_entreprise_A.pdf',
          type_document: 'Devis',
          statut: 'validé',
          created_at: new Date().toISOString(),
        },
        {
          id: 'doc-2',
          nom_fichier: 'Plans_architecte.pdf',
          type_document: 'Plan',
          statut: 'en_attente',
          created_at: new Date().toISOString(),
        },
      ];

      const mockJournal = [
        {
          id: 'journal-1',
          action: 'Projet créé',
          description: 'Nouveau projet de rénovation créé',
          date: new Date().toISOString(),
        },
      ];

      setProjets(mockProjets);
      setDocuments(mockDocuments);
      setJournal(mockJournal);
    } catch (error) {
      console.error('Erreur lors du chargement des données client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File, typeDocument: string, projetId?: string) => {
    if (!currentUser) return;

    setUploadingDoc(true);
    try {
      // Simuler l'upload de document
      const fileName = `${Date.now()}_${file.name}`;

      // Ajouter le document aux données locales
      const newDocument = {
        id: `doc-${Date.now()}`,
        nom_fichier: fileName,
        type_document: typeDocument,
        statut: 'en_attente',
        created_at: new Date().toISOString(),
      };

      setDocuments(prev => [newDocument, ...prev]);

      console.log(`✅ Document "${typeDocument}" téléchargé: ${fileName}`);

      await fetchClientData();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSignDocument = async (signatureData: string) => {
    if (!currentUser || !selectedDocumentId) return;

    try {
      // Simuler la signature
      console.log(`✅ Document ${selectedDocumentId} signé`);

      // Mettre à jour le statut du document
      setDocuments(prev =>
        prev.map(doc => (doc.id === selectedDocumentId ? { ...doc, statut: 'validé' } : doc))
      );

      setShowSignature(false);
      setSelectedDocumentId(null);
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validé':
      case 'terminé':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'en_cours':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'en_attente':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'refusé':
      case 'archivé':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'validé':
      case 'terminé':
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

  const projetActuel = projets.find(p => p.status === 'in_progress') || projets[0];
  const propositionActuelle = propositions.find(p => p.projet_id === projetActuel?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Logo discret en haut à droite */}
      <div className="absolute top-4 right-4 z-10">
        <Logo size="sm" variant="full" className="opacity-60" />
      </div>

      {/* En-tête de bienvenue */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bonjour {currentUser?.firstName} {currentUser?.lastName} 👋
              </h1>
              <p className="text-gray-600">Bienvenue dans votre espace client TÉMI</p>
              {projetActuel && (
                <div className="mt-3 flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(projetActuel.status)}`}
                  >
                    {getStatusIcon(projetActuel.status)}
                    <span className="ml-2">Projet {projetActuel.status}</span>
                  </span>
                  <span className="ml-3 text-gray-600">{projetActuel.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User size={16} className="mr-2" />
              Mes Projets
            </button>

            <button
              onClick={() => setActiveTab('ai_proposal')}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ai_proposal'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Brain size={16} className="mr-2" />
              Ma Proposition
              {propositionActuelle && (
                <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mes projets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Mes projets</h2>
                <p className="text-gray-600">Suivi de vos projets en cours</p>
              </div>
              <div className="p-6">
                {projets.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucun projet en cours</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projets.map(projet => (
                      <div key={projet.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{projet.title}</h3>
                            <p className="text-sm text-gray-600">{projet.description}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(projet.status)}`}
                          >
                            {getStatusIcon(projet.status)}
                            <span className="ml-2">En cours</span>
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>📍 {projet.location?.address}</p>
                          <p className="mt-1">💰 Budget: 40 000 - 50 000€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Étapes du projet */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Étapes de votre projet</h2>
                <p className="text-gray-600">Où en est votre projet</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-green-900">Projet créé</p>
                      <p className="text-sm text-green-700">Votre demande a été enregistrée</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-blue-900">Analyse en cours</p>
                      <p className="text-sm text-blue-700">Votre mandataire étudie vos besoins</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-700">Recherche d'entreprises</p>
                      <p className="text-sm text-gray-600">Sélection des meilleurs partenaires</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-700">Proposition personnalisée</p>
                      <p className="text-sm text-gray-600">Devis optimisé par IA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Documents reçus */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Mes Documents</h2>
                <p className="text-gray-600">Documents de votre projet</p>
              </div>
              <div className="p-6">
                {documents.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 text-sm">Aucun document disponible</p>
                    <p className="text-xs text-gray-400 mt-1">Les documents apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.nom_fichier}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.statut)}`}
                              >
                                {doc.statut}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Votre mandataire</h2>
                <p className="text-gray-600">Contact TÉMI</p>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Jean-Marc Leton</h3>
                  <p className="text-sm text-gray-600">Mandataire TÉMI</p>
                  <p className="text-sm text-blue-600 mt-2">📞 01 23 45 67 89</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Proposition IA */}
      {activeTab === 'ai_proposal' && (
        <div className="space-y-6">
          {projetActuel ? (
            <>
              {/* Proposition globale générée */}
              {propositionActuelle ? (
                <PropositionGlobaleViewer
                  proposition={propositionActuelle}
                  onValidate={comments => validateProposition(propositionActuelle.id, comments)}
                  onRequestModification={requests =>
                    requestModification(propositionActuelle.id, requests)
                  }
                  onSign={signatureData => signProposition(propositionActuelle.id, signatureData)}
                  isLoading={loading}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Votre proposition en préparation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Votre mandataire TÉMI travaille actuellement sur votre projet. Une proposition
                    personnalisée sera bientôt disponible.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <Zap className="inline mr-1" size={14} />
                      Notre IA sélectionne automatiquement les meilleures offres pour votre projet
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun projet actif</h3>
              <p className="text-gray-600">
                Vous devez avoir un projet en cours pour utiliser la proposition IA.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de signature */}
      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Signature électronique</h3>
            <p className="text-sm text-gray-600 mb-6">
              Signez le document en traçant votre signature dans le cadre ci-dessous.
            </p>
            <SignaturePad
              onChange={signature => {
                if (signature) {
                  handleSignDocument(signature);
                }
              }}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSignature(false);
                  setSelectedDocumentId(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
