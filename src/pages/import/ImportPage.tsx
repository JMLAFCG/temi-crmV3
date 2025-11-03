import React, { useState } from 'react';
import { Upload, List } from 'lucide-react';
import { ImportWizard } from '../../components/import/ImportWizard';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const ImportPage: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [entityType, setEntityType] = useState<'company' | 'prospect'>('prospect');
  const { user } = useAuthStore();

  const canImport = user?.role && ['admin', 'manager', 'mandatary'].includes(user.role);

  if (!canImport) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-lg text-gray-600">
            Vous n'avez pas les permissions pour accéder à cette fonctionnalité
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {!showWizard ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Import en masse
            </h1>
            <p className="text-gray-600">
              Importez vos entreprises et prospects depuis Excel ou CSV
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Importer des prospects
                </h3>
                <List size={24} className="text-gray-400" />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Importez une liste de prospects à contacter (particuliers ou entreprises)
              </p>

              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Nom, prénom, email, téléphone</li>
                <li>• Qualification automatique</li>
                <li>• Attribution au mandataire</li>
              </ul>

              <Button
                variant="primary"
                leftIcon={<Upload size={16} />}
                fullWidth
                onClick={() => {
                  setEntityType('prospect');
                  setShowWizard(true);
                }}
              >
                Importer des prospects
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Importer des entreprises
                </h3>
                <Upload size={24} className="text-gray-400" />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Importez des entreprises partenaires ou prestataires
              </p>

              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• SIRET, nom, contact</li>
                <li>• Spécialités et zones</li>
                <li>• Validation avant activation</li>
              </ul>

              <Button
                variant="outline"
                leftIcon={<Upload size={16} />}
                fullWidth
                onClick={() => {
                  setEntityType('company');
                  setShowWizard(true);
                }}
              >
                Importer des entreprises
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              À propos de l'import
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Formats acceptés: Excel (.xlsx, .xls) et CSV</li>
              <li>• Mapping automatique des colonnes avec validation</li>
              <li>• Validation manuelle par un manager avant ingestion</li>
              <li>• Détection des doublons sur email/SIRET</li>
              <li>• Historique et audit complet</li>
            </ul>
          </div>
        </div>
      ) : (
        <ImportWizard
          entityType={entityType}
          onComplete={() => {
            setShowWizard(false);
            alert('Import soumis avec succès !');
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

export default ImportPage;
