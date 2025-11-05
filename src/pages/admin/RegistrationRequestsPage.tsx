import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, Mail, Phone, Building, FileText, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useRegistrationRequestStore } from '../../store/registrationRequestStore';

const RegistrationRequestsPage: React.FC = () => {
  const { requests, loading, error, fetchRequests, approveRequest, rejectRequest } = useRegistrationRequestStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const roleLabels = {
    mandataire: 'Mandataire',
    apporteur: "Apporteur d'affaires",
    partner_company: 'Entreprise partenaire',
  };

  const statusLabels = {
    pending: 'En attente',
    approved: 'Approuvée',
    rejected: 'Rejetée',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const handleApprove = async (id: string) => {
    try {
      const result = await approveRequest(id, createAccount);
      if (result.success) {
        alert(createAccount ? 'Demande approuvée et compte créé avec succès!' : 'Demande approuvée!');
      }
    } catch (err) {
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      await rejectRequest(selectedRequest, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      alert('Demande rejetée');
    } catch (err) {
      alert('Erreur lors du rejet');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes d'inscription</h1>
        <p className="text-gray-600 mt-1">
          Gérez les demandes pour rejoindre votre réseau
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} en attente
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Toutes ({requests.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          En attente ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Approuvées ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'rejected'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Rejetées ({requests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
          <p className="text-gray-600">
            {filterStatus === 'pending'
              ? 'Aucune demande en attente de traitement.'
              : 'Aucune demande avec ce statut.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.first_name} {request.last_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {roleLabels[request.requested_role]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      {request.email}
                    </div>
                    {request.phone && (
                      <div className="flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {request.phone}
                      </div>
                    )}
                    {request.company_name && (
                      <div className="flex items-center">
                        <Building size={16} className="mr-2 text-gray-400" />
                        {request.company_name}
                        {request.siret && <span className="ml-1 text-gray-400">({request.siret})</span>}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {request.motivation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <FileText size={16} className="mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Motivation</p>
                          <p className="text-sm text-gray-600">{request.motivation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-xs font-medium text-red-700 mb-1">Raison du rejet</p>
                      <p className="text-sm text-red-600">{request.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="ml-4 flex flex-col gap-2">
                    <div className="mb-2">
                      <label className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={createAccount}
                          onChange={e => setCreateAccount(e.target.checked)}
                          className="mr-2 rounded border-gray-300"
                        />
                        Créer le compte utilisateur
                      </label>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle size={16} />}
                      onClick={() => handleApprove(request.id)}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<XCircle size={16} />}
                      onClick={() => {
                        setSelectedRequest(request.id);
                        setShowRejectModal(true);
                      }}
                    >
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeter la demande</h3>
            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet. Cette information sera conservée dans l'historique.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleReject}>
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequestsPage;
