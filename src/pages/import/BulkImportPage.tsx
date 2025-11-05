import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Users, Building2, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useClientStore } from '../../store/clientStore';
import { useCompanyStore } from '../../store/companyStore';
import {
  parseExcelFile,
  generateExcelTemplate,
  validateClientRow,
  validateCompanyRow,
  ClientImportRow,
  CompanyImportRow,
  ImportResult,
} from '../../utils/excelImport';

type ImportType = 'prospects' | 'companies' | null;

export default function BulkImportPage() {
  const [activeImport, setActiveImport] = useState<ImportType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult<any> | null>(null);
  const [imported, setImported] = useState(false);

  const { addClient } = useClientStore();
  const { addCompany } = useCompanyStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: ImportType) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setResult(null);
    setImported(false);
    setActiveImport(type);

    try {
      const validator = type === 'prospects' ? validateClientRow : validateCompanyRow;
      const parseResult = await parseExcelFile(selectedFile, validator);
      setResult(parseResult);
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!result || result.success.length === 0 || !activeImport) return;

    setImporting(true);
    try {
      if (activeImport === 'prospects') {
        for (const client of result.success as ClientImportRow[]) {
          await addClient(client);
        }
      } else {
        for (const company of result.success as CompanyImportRow[]) {
          await addCompany({
            ...company,
            type: 'partner',
            activities: company.activities ? company.activities.split(',').map(a => a.trim()) : [],
            zones: company.zones ? company.zones.split(',').map(z => z.trim()) : [],
            is_partner: false,
          });
        }
      }
      setImported(true);
    } catch (error: any) {
      alert(`Erreur lors de l'import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = (type: 'prospects' | 'companies') => {
    if (type === 'prospects') {
      const headers = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'postal_code', 'company_name'];
      const example = ['Jean', 'Dupont', 'jean.dupont@email.com', '0612345678', '123 rue de Paris', 'Paris', '75001', 'Entreprise ABC'];
      generateExcelTemplate(headers, example, `template_prospects_${Date.now()}.xlsx`);
    } else {
      const headers = ['name', 'siret', 'email', 'phone', 'address', 'city', 'postal_code', 'activities', 'zones'];
      const example = ['Entreprise XYZ', '12345678901234', 'contact@xyz.com', '0123456789', '456 avenue de Lyon', 'Lyon', '69001', 'Plomberie,Electricité', 'Rhône,Isère'];
      generateExcelTemplate(headers, example, `template_entreprises_${Date.now()}.xlsx`);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResult(null);
    setImported(false);
    setActiveImport(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Import en masse</h1>
        <p className="text-gray-600">Importez vos entreprises et prospects depuis Excel ou CSV</p>
      </div>

      {!activeImport && !result && (
        <div className="grid md:grid-cols-2 gap-6">
          <ImportCard
            title="Importer des prospects"
            description="Importez une liste de prospects à contacter (particuliers ou entreprises)"
            icon={<Users className="w-12 h-12 text-red-600" />}
            features={[
              'Nom, prénom, email, téléphone',
              'Qualification automatique',
              'Attribution au mandataire',
            ]}
            onDownloadTemplate={() => handleDownloadTemplate('prospects')}
            onFileSelect={(e) => handleFileChange(e, 'prospects')}
            buttonColor="red"
          />

          <ImportCard
            title="Importer des entreprises"
            description="Importez des entreprises partenaires ou prestataires"
            icon={<Building2 className="w-12 h-12 text-gray-700" />}
            features={[
              'SIRET, nom, contact',
              'Spécialités et zones',
              'Validation avant activation',
            ]}
            onDownloadTemplate={() => handleDownloadTemplate('companies')}
            onFileSelect={(e) => handleFileChange(e, 'companies')}
            buttonColor="gray"
          />
        </div>
      )}

      {parsing && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center py-8">
            <Loader size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Analyse du fichier...</span>
          </div>
        </div>
      )}

      {result && !imported && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Résultats de l'analyse - {activeImport === 'prospects' ? 'Prospects' : 'Entreprises'}
            </h2>
            <p className="text-sm text-gray-600">Fichier: {file?.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle size={24} className="text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Lignes valides</p>
                  <p className="text-3xl font-bold text-green-600">{result.success.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle size={24} className="text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Erreurs</p>
                  <p className="text-3xl font-bold text-red-600">{result.errors.length}</p>
                </div>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
              <h4 className="font-medium text-red-900 mb-2">Erreurs détectées</h4>
              <ul className="space-y-2">
                {result.errors.slice(0, 10).map((error, index) => (
                  <li key={index} className="text-sm text-red-800">
                    <span className="font-medium">Ligne {error.row}:</span> {error.error}
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li className="text-sm text-red-700 font-medium">
                    ... et {result.errors.length - 10} autres erreurs
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={resetImport}>
              Annuler
            </Button>
            {result.success.length > 0 && (
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importing}
                leftIcon={importing ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
              >
                {importing ? 'Import en cours...' : `Importer ${result.success.length} ${activeImport === 'prospects' ? 'prospects' : 'entreprises'}`}
              </Button>
            )}
          </div>
        </div>
      )}

      {imported && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">Import réussi!</h3>
            <p className="text-gray-600 mb-6">
              {result?.success.length} {activeImport === 'prospects' ? 'prospects' : 'entreprises'} ont été importés avec succès.
            </p>
            <Button variant="primary" onClick={resetImport}>
              Nouvel import
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">À propos de l'import</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>Formats acceptés:</strong> Excel (.xlsx, .xls) et CSV</li>
          <li>• <strong>Mapping automatique:</strong> des colonnes avec validation</li>
          <li>• <strong>Validation manuelle:</strong> par un manager avant ingestion</li>
          <li>• <strong>Détection des doublons:</strong> sur email/SIRET</li>
          <li>• <strong>Historique et audit:</strong> complet</li>
        </ul>
      </div>
    </div>
  );
}

interface ImportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  onDownloadTemplate: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonColor: 'red' | 'gray';
}

function ImportCard({
  title,
  description,
  icon,
  features,
  onDownloadTemplate,
  onFileSelect,
  buttonColor,
}: ImportCardProps) {
  const fileInputId = `file-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const bgColor = buttonColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-800';
  const borderColor = buttonColor === 'red' ? 'border-red-600' : 'border-gray-700';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-900 ml-4">{title}</h2>
      </div>

      <p className="text-gray-600 mb-4">{description}</p>

      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start">
            <span className="mr-2">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <Button
          variant="outline"
          leftIcon={<Download size={16} />}
          onClick={onDownloadTemplate}
          className="w-full"
        >
          Télécharger le modèle Excel
        </Button>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFileSelect}
          className="hidden"
          id={fileInputId}
        />
        <label htmlFor={fileInputId}>
          <div className={`${bgColor} text-white px-4 py-3 rounded-lg cursor-pointer text-center font-medium transition-colors flex items-center justify-center`}>
            <Upload size={16} className="mr-2" />
            {title}
          </div>
        </label>
      </div>
    </div>
  );
}
