import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Send, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface Negotiation {
  id: string;
  status: string;
  original_amount: number;
  requested_amount: number;
  negotiated_amount?: number;
  admin_message?: string;
  entreprise_response?: string;
  deadline: string;
  created_at: string;
}

export const EnterpriseNegotiationPanel = () => {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState('');
  const [counterOffer, setCounterOffer] = useState(0);
  const [selectedNegotiation, setSelectedNegotiation] = useState<string | null>(null);

  useEffect(() => {
    // Simulation de données de négociation en attendant la table devis_negotiations
    setNegotiations([
      {
        id: '1',
        status: 'pending',
        original_amount: 25000,
        requested_amount: 23000,
        admin_message: 'Le client souhaite négocier le prix pour ce projet de rénovation.',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      // Table devis_negotiations n'existe pas encore
      // Utiliser des données de démonstration pour l'instant
      setNegotiations([
        {
          id: 'demo-1',
          status: 'pending',
          original_amount: 25000,
          requested_amount: 22000,
          admin_message: 'Le client souhaite négocier le prix pour ce projet de rénovation.',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Erreur chargement négociations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToNegotiation = async (negotiationId: string, accept: boolean) => {
    try {
      const updateData: any = {
        status: accept ? 'accepted' : 'rejected',
        entreprise_response: responseMessage,
        response_date: new Date().toISOString(),
      };

      if (accept && counterOffer > 0) {
        updateData.negotiated_amount = counterOffer;
      }

      // Simulation de la mise à jour pour la démo
      console.log('Réponse négociation:', updateData);

      setResponseMessage('');
      setCounterOffer(0);
      setSelectedNegotiation(null);

      // Mettre à jour localement pour la démo
      setNegotiations(prev =>
        prev.map(neg => (neg.id === negotiationId ? { ...neg, ...updateData } : neg))
      );
    } catch (error) {
      console.error('Erreur réponse négociation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <AlertTriangle size={16} />;
      case 'in_progress':
      case 'pending':
        return <Clock size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Négociations TÉMI</h3>
        <p className="text-sm text-gray-600">Demandes de négociation sur vos devis</p>
      </div>

      <div className="p-4">
        {negotiations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune négociation en cours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {negotiations.map(negotiation => (
              <div key={negotiation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(negotiation.status)}`}
                      >
                        {getStatusIcon(negotiation.status)}
                        <span className="ml-2">
                          {negotiation.status === 'pending'
                            ? 'En attente de réponse'
                            : negotiation.status === 'accepted'
                              ? 'Acceptée'
                              : negotiation.status === 'rejected'
                                ? 'Refusée'
                                : 'En cours'}
                        </span>
                      </span>

                      {new Date(negotiation.deadline) < new Date() &&
                        negotiation.status === 'pending' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Échéance dépassée
                          </span>
                        )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Montant original:</strong>{' '}
                        {negotiation.original_amount.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                      <p>
                        <strong>Montant demandé:</strong>{' '}
                        {negotiation.requested_amount.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                      <p>
                        <strong>Échéance:</strong>{' '}
                        {new Date(negotiation.deadline).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message de TÉMI */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">Message de TÉMI:</p>
                  <p className="text-sm text-blue-700">"{negotiation.admin_message}"</p>
                </div>

                {/* Réponse de l'entreprise */}
                {negotiation.entreprise_response && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-green-800 mb-1">Votre réponse:</p>
                    <p className="text-sm text-green-700">"{negotiation.entreprise_response}"</p>
                    {negotiation.negotiated_amount && (
                      <p className="text-sm text-green-700 mt-1">
                        <strong>Contre-proposition:</strong>{' '}
                        {negotiation.negotiated_amount.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions pour répondre */}
                {negotiation.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Votre réponse
                      </label>
                      <textarea
                        value={responseMessage}
                        onChange={e => setResponseMessage(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Votre réponse à la demande de négociation..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contre-proposition (optionnel)
                      </label>
                      <Input
                        type="number"
                        value={counterOffer}
                        onChange={e => setCounterOffer(Number(e.target.value))}
                        placeholder="Nouveau montant proposé"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => handleRespondToNegotiation(negotiation.id, false)}
                        disabled={!responseMessage.trim()}
                      >
                        Refuser
                      </Button>
                      <Button
                        variant="primary"
                        leftIcon={<CheckCircle size={16} />}
                        onClick={() => handleRespondToNegotiation(negotiation.id, true)}
                        disabled={!responseMessage.trim()}
                      >
                        Accepter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseNegotiationPanel;
