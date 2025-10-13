import React, { useState } from 'react';
import {
  FileText,
  Download,
  Edit,
  Check,
  X,
  AlertTriangle,
  Building,
  Euro,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PropositionGlobale, PropositionLot } from '../../types';
import { SignaturePad } from '../projects/SignaturePad';

interface PropositionGlobaleViewerProps {
  proposition: PropositionGlobale & { lots?: PropositionLot[] };
  onValidate: (comments?: string) => void;
  onRequestModification: (requests: any[]) => void;
  onSign: (signatureData: string) => void;
  isLoading?: boolean;
}

export const PropositionGlobaleViewer: React.FC<PropositionGlobaleViewerProps> = ({
  proposition,
  onValidate,
  onRequestModification,
  onSign,
  isLoading = false,
}) => {
  const [showSignature, setShowSignature] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState('');
  const [modificationRequests, setModificationRequests] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validee':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'soumise':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refusee':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'modifiee':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validee':
        return 'Validée';
      case 'soumise':
        return 'Soumise';
      case 'en_attente':
        return 'En attente';
      case 'refusee':
        return 'Refusée';
      case 'modifiee':
        return 'Modification demandée';
      default:
        return status;
    }
  };

  const handleValidate = () => {
    if (showComments) {
      onValidate(comments);
      setShowComments(false);
      setComments('');
    } else {
      onValidate();
    }
  };

  const handleSign = (signatureData: string) => {
    onSign(signatureData);
    setShowSignature(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <Zap className="text-blue-600 mr-2" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Proposition Globale IA</h2>
              {proposition.generated_by_ai && (
                <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Générée par IA
                </span>
              )}
            </div>
            <p className="text-gray-600">
              Proposition intelligente basée sur {proposition.ai_analysis?.analyses_count || 0}{' '}
              devis analysés
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(proposition.status)}`}
            >
              {getStatusLabel(proposition.status)}
            </span>

            {proposition.fichier_proposition && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={16} />}
                onClick={() => window.open(proposition.fichier_proposition, '_blank')}
              >
                Télécharger PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Montant HT</p>
                <p className="text-2xl font-bold text-blue-900">
                  {proposition.montant_ht?.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </p>
              </div>
              <Euro className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">TVA (20%)</p>
                <p className="text-2xl font-bold text-green-900">
                  {proposition.montant_tva?.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </p>
              </div>
              <Euro className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Total TTC</p>
                <p className="text-2xl font-bold text-purple-900">
                  {proposition.montant_total?.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </p>
              </div>
              <Euro className="text-purple-600" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">Délai estimé</p>
                <p className="text-2xl font-bold text-orange-900">
                  {proposition.delai_global_estime || 0} jours
                </p>
              </div>
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Détail des lots */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail par lots</h3>

        {proposition.lots && proposition.lots.length > 0 ? (
          <div className="space-y-4">
            {proposition.lots.map(lot => (
              <div key={lot.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 mr-2">{lot.lot_code}</span>
                      <h4 className="font-semibold text-gray-900">{lot.lot_name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{lot.description}</p>
                    {lot.justification_choix && (
                      <p className="text-xs text-blue-600 mt-2">💡 {lot.justification_choix}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {lot.montant_lot?.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">TTC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="text-gray-400 mr-2" size={16} />
                    <span className="text-sm font-medium text-gray-700">{lot.entreprise_name}</span>
                  </div>

                  {lot.delai_realisation && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1" size={14} />
                      {lot.delai_realisation} jours
                    </div>
                  )}
                </div>

                {/* Alternatives disponibles */}
                {lot.alternatives && lot.alternatives.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Autres options disponibles:
                    </p>
                    <div className="space-y-1">
                      {lot.alternatives.map((alt: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs text-gray-600">
                          <span>{alt.entreprise_name}</span>
                          <span>
                            {alt.montant?.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun lot détaillé disponible</p>
          </div>
        )}
      </div>

      {/* Actions client */}
      {proposition.status === 'soumise' && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              leftIcon={<Edit size={16} />}
              onClick={() => {
                // Logique pour demander des modifications
                const requests = [
                  { lot: 'Exemple', modification: 'Demande de modification exemple' },
                ];
                onRequestModification(requests);
              }}
            >
              Demander une modification
            </Button>

            <Button
              variant="outline"
              leftIcon={<Check size={16} />}
              onClick={() => setShowComments(true)}
            >
              Valider avec commentaires
            </Button>

            <Button
              variant="primary"
              leftIcon={<Check size={16} />}
              onClick={() => setShowSignature(true)}
              isLoading={isLoading}
            >
              ✅ Accepter et signer
            </Button>
          </div>
        </div>
      )}

      {/* Informations IA */}
      {proposition.ai_analysis && (
        <div className="p-6 border-t border-gray-100">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Zap className="text-blue-600 mr-2" size={16} />
              <h4 className="text-sm font-medium text-blue-800">Analyse IA</h4>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• {proposition.ai_analysis.analyses_count} devis analysés et comparés</p>
              <p>• {proposition.ai_analysis.lots_compared} lots identifiés et optimisés</p>
              <p>
                • Confiance moyenne:{' '}
                {Math.round((proposition.ai_analysis.confidence_average || 0) * 100)}%
              </p>
              <p>• Critère de sélection: {proposition.ai_analysis.selection_criteria}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal commentaires */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Valider la proposition</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaires (optionnel)
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Vos commentaires sur la proposition..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowComments(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleValidate} isLoading={isLoading}>
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal signature */}
      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Signature de la proposition</h3>
            <p className="text-sm text-gray-600 mb-6">
              En signant cette proposition, vous acceptez les conditions et montants proposés. Cette
              signature a valeur d'engagement.
            </p>

            <div className="mb-6">
              <SignaturePad
                onChange={signature => {
                  if (signature) {
                    handleSign(signature);
                  }
                }}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowSignature(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
