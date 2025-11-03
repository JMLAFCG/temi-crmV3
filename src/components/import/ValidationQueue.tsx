import React, { useEffect, useState } from 'react';
import { Check, X, Eye, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useImportStore } from '../../store/importStore';

export const ValidationQueue: React.FC = () => {
  const { imports, loading, fetchImports, approveImport, rejectImport } = useImportStore();
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  const pendingImports = imports.filter(i => i.status === 'pending');
  const processedImports = imports.filter(i => i.status !== 'pending');

  const handleApprove = async (importId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir approuver cet import ?')) {
      await approveImport(importId);
    }
  };

  const handleReject = async () => {
    if (!selectedImport || !rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }

    await rejectImport(selectedImport, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedImport(null);
  };

  const openRejectModal = (importId: string) => {
    setSelectedImport(importId);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const config = styles[status] || styles.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} className="mr-1" />
        {status === 'pending' && 'En attente'}
        {status === 'approved' && 'Approuvé'}
        {status === 'rejected' && 'Rejeté'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Validation des imports
        </h2>
        <p className="text-gray-600">
          Validez ou rejetez les imports en attente avant ingestion dans la base de données
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-gray-900">{pendingImports.length}</p>
            </div>
            <Clock size={40} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approuvés</p>
              <p className="text-3xl font-bold text-green-600">
                {processedImports.filter(i => i.status === 'approved').length}
              </p>
            </div>
            <CheckCircle size={40} className="text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejetés</p>
              <p className="text-3xl font-bold text-red-600">
                {processedImports.filter(i => i.status === 'rejected').length}
              </p>
            </div>
            <XCircle size={40} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Liste des imports en attente */}
      {pendingImports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Imports en attente de validation
          </h3>

          <div className="space-y-3">
            {pendingImports.map(importItem => (
              <div
                key={importItem.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {importItem.file_name}
                      </h4>
                      {getStatusBadge(importItem.status)}
                      <span className="text-sm text-gray-500">
                        {importItem.entity_type === 'company' ? 'Entreprises' : 'Prospects'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>Total: {importItem.total_rows} lignes</span>
                      <span className="text-green-600">Valides: {importItem.valid_rows}</span>
                      {importItem.invalid_rows > 0 && (
                        <span className="text-red-600">
                          <AlertCircle size={14} className="inline mr-1" />
                          Erreurs: {importItem.invalid_rows}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {new Date(importItem.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={14} />}
                      onClick={() => {
                        /* TODO: Ouvrir modal détails */
                      }}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Check size={14} />}
                      onClick={() => handleApprove(importItem.id)}
                      disabled={loading}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<X size={14} />}
                      onClick={() => openRejectModal(importItem.id)}
                      disabled={loading}
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des imports traités */}
      {processedImports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Historique des imports
          </h3>

          <div className="space-y-3">
            {processedImports.map(importItem => (
              <div
                key={importItem.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {importItem.file_name}
                      </h4>
                      {getStatusBadge(importItem.status)}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>{importItem.total_rows} lignes</span>
                      {importItem.validated_at && (
                        <span className="text-gray-400">
                          Validé le {new Date(importItem.validated_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {importItem.rejection_reason && (
                      <p className="mt-2 text-sm text-red-600">
                        Raison: {importItem.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rejeter l'import
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet. L'utilisateur sera notifié.
            </p>

            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={4}
            />

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedImport(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || loading}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingImports.length === 0 && processedImports.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">Aucun import pour le moment</p>
        </div>
      )}
    </div>
  );
};
