import React, { useState, useRef } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { parseExcelFile, generateExcelTemplate, ImportResult } from '../../utils/excelImport';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'clients' | 'companies' | 'providers';
  onImport: (data: any[]) => Promise<void>;
  validator: (row: any, index: number) => { valid: boolean; data?: any; error?: string };
  templateHeaders: string[];
  templateExample: any[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  entityType,
  onImport,
  validator,
  templateHeaders,
  templateExample,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult<any> | null>(null);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entityLabels = {
    clients: 'clients',
    companies: 'entreprises',
    providers: 'apporteurs d\'affaires',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setResult(null);
    setImported(false);

    try {
      const parseResult = await parseExcelFile(selectedFile, validator);
      setResult(parseResult);
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!result || result.success.length === 0) return;

    setImporting(true);
    try {
      await onImport(result.success);
      setImported(true);
    } catch (error: any) {
      alert(`Erreur lors de l'import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const filename = `template_${entityType}_${Date.now()}.xlsx`;
    generateExcelTemplate(templateHeaders, templateExample, filename);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setImported(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Import en masse - {entityLabels[entityType]}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Téléchargez le modèle Excel ci-dessous</li>
              <li>Remplissez le fichier avec vos données</li>
              <li>Uploadez le fichier complété</li>
              <li>Vérifiez les données et confirmez l'import</li>
            </ol>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={handleDownloadTemplate}
            >
              Télécharger le modèle Excel
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Cliquez pour sélectionner un fichier Excel
              </p>
              <p className="text-xs text-gray-500">ou glissez-déposez le fichier ici</p>
            </label>
            {file && (
              <p className="mt-4 text-sm font-medium text-gray-900">
                Fichier sélectionné: {file.name}
              </p>
            )}
          </div>

          {parsing && (
            <div className="flex items-center justify-center py-8">
              <Loader size={32} className="animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Analyse du fichier...</span>
            </div>
          )}

          {result && !imported && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle size={20} className="text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Lignes valides</p>
                      <p className="text-2xl font-bold text-green-600">{result.success.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle size={20} className="text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Erreurs</p>
                      <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
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
            </div>
          )}

          {imported && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
              <h3 className="text-lg font-medium text-green-900 mb-1">Import réussi!</h3>
              <p className="text-sm text-green-700">
                {result?.success.length} {entityLabels[entityType]} ont été importés avec succès.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={handleClose}>
            {imported ? 'Fermer' : 'Annuler'}
          </Button>
          {result && result.success.length > 0 && !imported && (
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={importing}
              leftIcon={importing ? <Loader size={16} className="animate-spin" /> : undefined}
            >
              {importing ? 'Import en cours...' : `Importer ${result.success.length} ${entityLabels[entityType]}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
