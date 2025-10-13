import React, { useState, useEffect } from 'react';
import { Upload, Brain, CheckCircle, Clock, AlertTriangle, Zap, BarChart } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAIQuoteStore } from '../../store/aiQuoteStore';
import { DevisAnalysis } from '../../types';

interface AIQuoteProcessorProps {
  projetId: string;
  onQuoteUploaded?: (documentId: string) => void;
}

export const AIQuoteProcessor: React.FC<AIQuoteProcessorProps> = ({
  projetId,
  onQuoteUploaded,
}) => {
  const { analyses, loading, processQuoteWithAI, fetchAnalyses } = useAIQuoteStore();
  const [uploadingQuote, setUploadingQuote] = useState(false);

  useEffect(() => {
    fetchAnalyses(projetId);
  }, [projetId, fetchAnalyses]);

  const handleQuoteUpload = async (file: File, entrepriseId: string) => {
    setUploadingQuote(true);
    try {
      // 1. Upload du fichier vers Supabase Storage (simulation)
      const fileName = `devis/${projetId}/${entrepriseId}_${Date.now()}_${file.name}`;
      const fileUrl = URL.createObjectURL(file); // En production, utiliser Supabase Storage

      // 2. Créer l'entrée document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          projet_id: projetId,
          entreprise_id: entrepriseId,
          type_document: 'devis_entreprise',
          nom_fichier: file.name,
          fichier_url: fileUrl,
          statut: 'en_attente',
        })
        .select()
        .single();

      if (docError) throw docError;

      // 3. Lancer le traitement IA
      await processQuoteWithAI(document.id, projetId);

      onQuoteUploaded?.(document.id);
    } catch (error) {
      console.error('Erreur upload devis:', error);
    } finally {
      setUploadingQuote(false);
    }
  };

  const getAnalysisStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'processing':
        return <Clock className="text-blue-600 animate-spin" size={20} />;
      case 'failed':
        return <AlertTriangle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getAnalysisStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Analysé';
      case 'processing':
        return 'En cours...';
      case 'failed':
        return 'Échec';
      default:
        return 'En attente';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Brain className="text-purple-600 mr-3" size={24} />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Traitement IA des Devis</h3>
            <p className="text-gray-600">Upload et analyse automatique des devis entreprises</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Déposer un devis entreprise</h4>
          <p className="text-gray-600 mb-4">
            L'IA analysera automatiquement le contenu et extraira les informations pertinentes
          </p>

          <input
            type="file"
            id="quote-upload"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                // En production, sélectionner l'entreprise
                const mockEntrepriseId = 'entreprise-' + Math.random().toString(36).substr(2, 9);
                handleQuoteUpload(file, mockEntrepriseId);
              }
            }}
            disabled={uploadingQuote}
          />

          <Button
            variant="primary"
            leftIcon={<Upload size={16} />}
            onClick={() => document.getElementById('quote-upload')?.click()}
            isLoading={uploadingQuote}
          >
            Sélectionner un fichier PDF
          </Button>

          <p className="text-xs text-gray-500 mt-2">Formats acceptés: PDF, DOC, DOCX (max 10MB)</p>
        </div>
      </div>

      {/* Analyses en cours */}
      {analyses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart className="text-blue-600 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Analyses IA</h3>
                <p className="text-gray-600">{analyses.length} devis en cours d'analyse</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Confiance moyenne:{' '}
                {Math.round(
                  (analyses.reduce((sum, a) => sum + a.ai_confidence, 0) / analyses.length) * 100
                )}
                %
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {analyses.map(analysis => (
              <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getAnalysisStatusIcon(analysis.processing_status)}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        Devis {analysis.extracted_data?.entreprise_name || 'Entreprise inconnue'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getAnalysisStatusLabel(analysis.processing_status)}
                        {analysis.processing_time_ms && ` • ${analysis.processing_time_ms}ms`}
                      </p>
                    </div>
                  </div>

                  {analysis.processing_status === 'completed' && (
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(analysis.ai_confidence)}`}
                      >
                        Confiance: {Math.round(analysis.ai_confidence * 100)}%
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {analysis.lots_detected?.length || 0} lots détectés
                      </p>
                    </div>
                  )}
                </div>

                {/* Détails de l'analyse */}
                {analysis.processing_status === 'completed' && analysis.extracted_data && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total HT</p>
                        <p className="font-medium text-gray-900">
                          {analysis.extracted_data.total_ht?.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </p>
                      </div>
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
                        <p className="text-gray-500">Lots</p>
                        <p className="font-medium text-gray-900">
                          {analysis.lots_detected?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Lots détectés */}
                    {analysis.lots_detected && analysis.lots_detected.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Lots identifiés:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.lots_detected.map((lot, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {lot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Erreur */}
                {analysis.processing_status === 'failed' && analysis.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <AlertTriangle className="inline mr-1" size={14} />
                      {analysis.error_message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statut global */}
      {analyses.length >= 2 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="text-green-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-green-800">
                ✅ Proposition globale générée automatiquement
              </p>
              <p className="text-sm text-green-700">
                L'IA a comparé {analyses.length} devis et sélectionné les meilleures offres par lot
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
