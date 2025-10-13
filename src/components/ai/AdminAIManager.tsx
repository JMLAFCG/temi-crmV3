import React, { useState, useEffect } from 'react';
import {
  Brain,
  FileText,
  Edit,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Euro,
  Building,
  Send,
  Eye,
  Download,
  RefreshCw,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface AdminAIManagerProps {
  projetId: string;
  onPropositionUpdated?: () => void;
}

interface DevisAnalysisWithNegotiation {
  id: string;
  entreprise_name: string;
  extracted_data: any;
  ai_confidence: number;
  processing_status: string;
  admin_override: boolean;
  negotiation?: {
    id: string;
    status: string;
    original_amount: number;
    requested_amount?: number;
    negotiated_amount?: number;
    admin_message?: string;
    entreprise_response?: string;
    deadline?: string;
  };
}

interface PropositionWithDetails {
  id: string;
  montant_total: number;
  status: string;
  admin_validated: boolean;
  quality_score?: number;
  client_presentation_ready: boolean;
  lots: Array<{
    id: string;
    lot_name: string;
    entreprise_name: string;
    montant_lot: number;
    admin_selected: boolean;
    admin_notes?: string;
    negotiation_status: string;
  }>;
  modifications: Array<{
    id: string;
    modification_type: string;
    reason: string;
    created_at: string;
    admin_user: { first_name: string; last_name: string };
  }>;
  comments: Array<{
    id: string;
    comment_type: string;
    content: string;
    is_resolved: boolean;
    created_at: string;
    admin_user: { first_name: string; last_name: string };
  }>;
}

export const AdminAIManager: React.FC<AdminAIManagerProps> = ({
  projetId,
  onPropositionUpdated,
}) => {
  const { user } = useAuthStore();
  const [analyses, setAnalyses] = useState<DevisAnalysisWithNegotiation[]>([]);
  const [proposition, setProposition] = useState<PropositionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'negotiations' | 'modifications'>(
    'overview'
  );
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [projetId]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Récupérer les analyses avec négociations
      const { data: analysesData, error: analysesError } = await supabase
        .from('devis_analysis')
        .select(
          `
          *,
          negotiations:devis_negotiations(*)
        `
        )
        .eq('projet_id', projetId);

      if (analysesError) throw analysesError;

      // Récupérer la proposition avec détails
      const { data: propositionData, error: propositionError } = await supabase
        .from('proposition_globale')
        .select(
          `
          *,
          lots:proposition_lots(*),
          modifications:proposition_modifications(
            *,
            admin_user:admin_user_id(first_name, last_name)
          ),
          comments:admin_comments(
            *,
            admin_user:admin_user_id(first_name, last_name)
          )
        `
        )
        .eq('projet_id', projetId)
        .single();

      if (propositionError && propositionError.code !== 'PGRST116') {
        throw propositionError;
      }

      setAnalyses(analysesData || []);
      setProposition(propositionData || null);
    } catch (error) {
      console.error('Erreur chargement données admin IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNegotiation = async () => {
    if (!selectedAnalysis || !user) return;

    try {
      const analysis = analyses.find(a => a.id === selectedAnalysis);
      if (!analysis) return;

      const { error } = await supabase.from('devis_negotiations').insert({
        devis_analysis_id: selectedAnalysis,
        projet_id: projetId,
        entreprise_id: analysis.extracted_data?.entreprise_id,
        admin_user_id: user.id,
        original_amount: analysis.extracted_data?.total_ttc || 0,
        requested_amount: requestedAmount,
        admin_message: negotiationMessage,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      });

      if (error) throw error;

      setShowNegotiationModal(false);
      setNegotiationMessage('');
      setRequestedAmount(0);
      setSelectedAnalysis(null);
      await fetchAdminData();
    } catch (error) {
      console.error('Erreur négociation:', error);
    }
  };

  const handleValidateProposition = async () => {
    if (!proposition || !user) return;

    try {
      const { error } = await supabase
        .from('proposition_globale')
        .update({
          admin_validated: true,
          admin_validated_by: user.id,
          admin_validated_at: new Date().toISOString(),
          client_presentation_ready: true,
          status: 'soumise',
        })
        .eq('id', proposition.id);

      if (error) throw error;

      await fetchAdminData();
      onPropositionUpdated?.();
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  const handleAddComment = async (commentType: string) => {
    if (!proposition || !user || !newComment.trim()) return;

    try {
      const { error } = await supabase.from('admin_comments').insert({
        proposition_id: proposition.id,
        admin_user_id: user.id,
        comment_type: commentType,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      await fetchAdminData();
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    }
  };

  const handleOverrideAnalysis = async (analysisId: string, overrideData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('devis_analysis')
        .update({
          admin_override: true,
          admin_override_by: user.id,
          admin_override_reason: overrideData.reason,
          manual_extracted_data: overrideData.data,
        })
        .eq('id', analysisId);

      if (error) throw error;

      await fetchAdminData();
    } catch (error) {
      console.error('Erreur surcharge analyse:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'modified':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'accepted':
        return <CheckCircle size={16} />;
      case 'in_progress':
      case 'pending':
        return <Clock size={16} />;
      case 'rejected':
        return <AlertTriangle size={16} />;
      case 'modified':
        return <Edit size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête admin */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="text-purple-600 mr-3" size={32} />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gestion IA - Administration
              </h2>
              <p className="text-gray-600">
                Contrôle et optimisation des propositions automatiques
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {proposition && !proposition.admin_validated && (
              <Button
                variant="primary"
                leftIcon={<CheckCircle size={16} />}
                onClick={handleValidateProposition}
              >
                Valider pour le client
              </Button>
            )}

            <Button variant="outline" leftIcon={<RefreshCw size={16} />} onClick={fetchAdminData}>
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Devis analysés</p>
            <p className="text-xl font-bold text-gray-900">{analyses.length}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Négociations actives</p>
            <p className="text-xl font-bold text-blue-600">
              {analyses.filter(a => a.negotiation?.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Qualité moyenne</p>
            <p className="text-xl font-bold text-green-600">
              {Math.round(
                (analyses.reduce((sum, a) => sum + a.ai_confidence, 0) / analyses.length) * 100
              )}
              %
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Statut proposition</p>
            <p className="text-xl font-bold text-purple-600">
              {proposition?.admin_validated ? 'Validée' : 'En cours'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <nav className="flex space-x-4 p-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye size={16} className="inline mr-2" />
            Vue d'ensemble
          </button>

          <button
            onClick={() => setActiveTab('negotiations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'negotiations'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Négociations
            {analyses.filter(a => a.negotiation?.status === 'in_progress').length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                {analyses.filter(a => a.negotiation?.status === 'in_progress').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('modifications')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'modifications'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit size={16} className="inline mr-2" />
            Modifications
          </button>
        </nav>

        <div className="p-6">
          {/* Onglet Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Analyses des devis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analyses des devis ({analyses.length})
                </h3>

                <div className="space-y-4">
                  {analyses.map(analysis => (
                    <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <Building className="text-gray-400 mr-3" size={20} />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {analysis.entreprise_name}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(analysis.processing_status)}`}
                              >
                                {getStatusIcon(analysis.processing_status)}
                                <span className="ml-1">
                                  {analysis.processing_status === 'completed'
                                    ? 'Analysé'
                                    : 'En cours'}
                                </span>
                              </span>

                              <span className="text-xs text-gray-500">
                                Confiance IA: {Math.round(analysis.ai_confidence * 100)}%
                              </span>

                              {analysis.admin_override && (
                                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                                  Modifié manuellement
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<MessageSquare size={14} />}
                            onClick={() => {
                              setSelectedAnalysis(analysis.id);
                              setRequestedAmount(analysis.extracted_data?.total_ttc || 0);
                              setShowNegotiationModal(true);
                            }}
                          >
                            Négocier
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Edit size={14} />}
                            onClick={() => {
                              // Ouvrir modal de modification manuelle
                            }}
                          >
                            Modifier
                          </Button>
                        </div>
                      </div>

                      {/* Détails de l'analyse */}
                      {analysis.extracted_data && (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total TTC</p>
                            <p className="font-medium text-gray-900">
                              {analysis.extracted_data.total_ttc?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Délai</p>
                            <p className="font-medium text-gray-900">
                              {analysis.extracted_data.delai_realisation || 'N/A'} jours
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Lots détectés</p>
                            <p className="font-medium text-gray-900">
                              {analysis.extracted_data.lots?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Statut négociation</p>
                            <p className="font-medium text-gray-900">
                              {analysis.negotiation?.status || 'Aucune'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Statut de négociation */}
                      {analysis.negotiation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Négociation en cours
                              </p>
                              <p className="text-xs text-blue-600">
                                Demande:{' '}
                                {analysis.negotiation.requested_amount?.toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR',
                                })}
                                {analysis.negotiation.negotiated_amount && (
                                  <span className="ml-2">
                                    → Négocié:{' '}
                                    {analysis.negotiation.negotiated_amount.toLocaleString(
                                      'fr-FR',
                                      { style: 'currency', currency: 'EUR' }
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(analysis.negotiation.status)}`}
                            >
                              {analysis.negotiation.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposition globale */}
              {proposition && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Proposition globale générée
                  </h3>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {proposition.montant_total.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </h4>
                        <p className="text-gray-600">Montant total TTC</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {proposition.quality_score && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {proposition.quality_score}%
                            </p>
                            <p className="text-xs text-gray-500">Qualité</p>
                          </div>
                        )}

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            proposition.admin_validated
                              ? 'text-green-600 bg-green-50 border-green-200'
                              : 'text-amber-600 bg-amber-50 border-amber-200'
                          }`}
                        >
                          {proposition.admin_validated ? 'Validée' : 'En attente validation'}
                        </span>
                      </div>
                    </div>

                    {/* Lots de la proposition */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Lots sélectionnés:</h5>
                      {proposition.lots.map(lot => (
                        <div
                          key={lot.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{lot.lot_name}</p>
                            <p className="text-sm text-gray-600">{lot.entreprise_name}</p>
                            {lot.admin_notes && (
                              <p className="text-xs text-blue-600 mt-1">Note: {lot.admin_notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {lot.montant_lot.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                lot.admin_selected
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {lot.admin_selected ? 'Sélectionné' : 'Non retenu'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Négociations */}
          {activeTab === 'negotiations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Négociations en cours</h3>
                <Button
                  variant="primary"
                  leftIcon={<MessageSquare size={16} />}
                  onClick={() => setShowNegotiationModal(true)}
                >
                  Nouvelle négociation
                </Button>
              </div>

              {analyses
                .filter(a => a.negotiation)
                .map(analysis => (
                  <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{analysis.entreprise_name}</h4>
                        <p className="text-sm text-gray-600">
                          Original:{' '}
                          {analysis.negotiation?.original_amount?.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                          → Demandé:{' '}
                          {analysis.negotiation?.requested_amount?.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </p>
                        {analysis.negotiation?.admin_message && (
                          <p className="text-sm text-blue-600 mt-2">
                            ""{analysis.negotiation.admin_message}""
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.negotiation?.status || '')}`}
                      >
                        {analysis.negotiation?.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Onglet Modifications */}
          {activeTab === 'modifications' && proposition && (
            <div className="space-y-6">
              {/* Ajout de commentaire */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Ajouter un commentaire interne</h4>
                <div className="flex space-x-3">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows={3}
                    className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Commentaire interne sur la proposition..."
                  />
                  <Button
                    variant="primary"
                    onClick={() => handleAddComment('internal')}
                    disabled={!newComment.trim()}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Historique des modifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Historique des modifications</h4>
                <div className="space-y-3">
                  {proposition.modifications.map(mod => (
                    <div key={mod.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{mod.modification_type}</p>
                          <p className="text-sm text-gray-600">{mod.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Par {mod.admin_user.first_name} {mod.admin_user.last_name} le{' '}
                            {new Date(mod.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commentaires internes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Commentaires internes</h4>
                <div className="space-y-3">
                  {proposition.comments.map(comment => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-900">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {comment.admin_user.first_name} {comment.admin_user.last_name} -{' '}
                            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {!comment.is_resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Marquer comme résolu
                            }}
                          >
                            Résoudre
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de négociation */}
      {showNegotiationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Négociation avec l'entreprise
            </h3>

            <div className="space-y-4">
              <Input
                label="Montant demandé (€)"
                type="number"
                value={requestedAmount}
                onChange={e => setRequestedAmount(Number(e.target.value))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message à l'entreprise
                </label>
                <textarea
                  value={negotiationMessage}
                  onChange={e => setNegotiationMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Expliquez votre demande de négociation..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowNegotiationModal(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                leftIcon={<Send size={16} />}
                onClick={handleStartNegotiation}
                disabled={!negotiationMessage.trim()}
              >
                Envoyer la demande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
