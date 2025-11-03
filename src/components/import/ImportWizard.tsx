import React, { useState, useRef } from 'react';
import { Upload, Download, Check, X, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';
import { useImportStore } from '../../store/importStore';

interface ImportWizardProps {
  entityType: 'company' | 'prospect';
  onComplete?: () => void;
  onCancel?: () => void;
}

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  required: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const COMPANY_FIELDS = [
  { id: 'name', label: 'Nom entreprise', required: true },
  { id: 'siret', label: 'SIRET', required: false },
  { id: 'email', label: 'Email', required: false },
  { id: 'phone', label: 'Téléphone', required: false },
  { id: 'address.street', label: 'Adresse', required: false },
  { id: 'address.postal_code', label: 'Code postal', required: false },
  { id: 'address.city', label: 'Ville', required: false },
  { id: 'website', label: 'Site web', required: false },
  { id: 'description', label: 'Description', required: false },
];

const PROSPECT_FIELDS = [
  { id: 'company_name', label: 'Nom entreprise', required: false },
  { id: 'contact_first_name', label: 'Prénom contact', required: true },
  { id: 'contact_last_name', label: 'Nom contact', required: true },
  { id: 'email', label: 'Email', required: true },
  { id: 'phone', label: 'Téléphone', required: false },
  { id: 'address.street', label: 'Adresse', required: false },
  { id: 'address.postal_code', label: 'Code postal', required: false },
  { id: 'address.city', label: 'Ville', required: false },
  { id: 'industry', label: 'Secteur', required: false },
  { id: 'notes', label: 'Notes', required: false },
];

export const ImportWizard: React.FC<ImportWizardProps> = ({
  entityType,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createImport } = useImportStore();

  const targetFields = entityType === 'company' ? COMPANY_FIELDS : PROSPECT_FIELDS;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Le fichier est vide');
        return;
      }

      const columns = Object.keys(jsonData[0] as any);
      setSourceColumns(columns);
      setParsedData(jsonData);

      const autoMapping = columns.map(col => ({
        sourceColumn: col,
        targetField: autoDetectField(col, targetFields.map(f => f.id)),
        required: false,
      }));

      setColumnMapping(autoMapping);
      setStep(2);
    } catch (error) {
      console.error('Erreur lecture fichier:', error);
      alert('Erreur lors de la lecture du fichier');
    } finally {
      setLoading(false);
    }
  };

  const autoDetectField = (columnName: string, fieldIds: string[]): string => {
    const normalized = columnName.toLowerCase().trim();

    const matches: Record<string, string[]> = {
      name: ['nom', 'name', 'raison sociale', 'entreprise'],
      company_name: ['entreprise', 'societe', 'company'],
      contact_first_name: ['prenom', 'firstname', 'first name'],
      contact_last_name: ['nom', 'lastname', 'last name', 'famille'],
      email: ['email', 'mail', 'courriel'],
      phone: ['telephone', 'phone', 'tel', 'portable', 'mobile'],
      siret: ['siret', 'siren'],
      'address.street': ['adresse', 'rue', 'street', 'address'],
      'address.postal_code': ['code postal', 'cp', 'postal code', 'zip'],
      'address.city': ['ville', 'city', 'commune'],
      website: ['site', 'website', 'web', 'url'],
      industry: ['secteur', 'industrie', 'industry', 'activite'],
    };

    for (const [fieldId, keywords] of Object.entries(matches)) {
      if (keywords.some(keyword => normalized.includes(keyword))) {
        return fieldId;
      }
    }

    return '';
  };

  const updateMapping = (sourceColumn: string, targetField: string) => {
    setColumnMapping(prev =>
      prev.map(m => (m.sourceColumn === sourceColumn ? { ...m, targetField } : m))
    );
  };

  const validateData = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredFields = targetFields.filter(f => f.required).map(f => f.id);

    const mappedFields = new Set(
      columnMapping.filter(m => m.targetField).map(m => m.targetField)
    );

    requiredFields.forEach(field => {
      if (!mappedFields.has(field)) {
        errors.push({
          row: 0,
          field,
          message: `Champ obligatoire non mappé: ${targetFields.find(f => f.id === field)?.label}`,
        });
      }
    });

    parsedData.forEach((row, index) => {
      columnMapping.forEach(mapping => {
        if (!mapping.targetField) return;

        const value = row[mapping.sourceColumn];
        const field = targetFields.find(f => f.id === mapping.targetField);

        if (field?.required && !value) {
          errors.push({
            row: index + 1,
            field: mapping.targetField,
            message: `Valeur manquante pour ${field.label}`,
          });
        }

        if (mapping.targetField === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              row: index + 1,
              field: 'email',
              message: 'Email invalide',
            });
          }
        }

        if (mapping.targetField === 'phone' && value) {
          const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
          if (!phoneRegex.test(value.toString().replace(/\s/g, ''))) {
            errors.push({
              row: index + 1,
              field: 'phone',
              message: 'Téléphone invalide',
            });
          }
        }
      });
    });

    return errors;
  };

  const handleValidate = () => {
    const errors = validateData();
    setValidationErrors(errors);
    if (errors.length === 0) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const mappedData = parsedData.map(row => {
        const mapped: any = {};
        columnMapping.forEach(m => {
          if (m.targetField) {
            const parts = m.targetField.split('.');
            if (parts.length === 2) {
              if (!mapped[parts[0]]) mapped[parts[0]] = {};
              mapped[parts[0]][parts[1]] = row[m.sourceColumn];
            } else {
              mapped[m.targetField] = row[m.sourceColumn];
            }
          }
        });
        return mapped;
      });

      const result = await createImport({
        file_name: file?.name || 'import.xlsx',
        entity_type: entityType,
        total_rows: parsedData.length,
        valid_rows: parsedData.length - validationErrors.length,
        invalid_rows: validationErrors.length,
        status: 'pending',
        metadata: {
          column_mapping: columnMapping,
          mapped_data: mappedData,
        },
      });

      if (result) {
        alert('Import créé avec succès ! En attente de validation.');
        onComplete?.();
      }
    } catch (error) {
      console.error('Erreur création import:', error);
      alert('Erreur lors de la création de l\'import');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = targetFields.map(f => f.label);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `template_${entityType}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Import {entityType === 'company' ? 'Entreprises' : 'Prospects'}
          </h2>
          <button
            onClick={downloadTemplate}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Download size={16} className="mr-1" />
            Télécharger modèle
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <FileSpreadsheet size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 mb-2">
              Glissez un fichier Excel ou CSV ici
            </p>
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="primary"
              leftIcon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Sélectionner un fichier
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              Fichier: <span className="font-medium">{file?.name}</span> ({parsedData.length} lignes)
            </p>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Mapping des colonnes
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sourceColumns.map(col => {
              const mapping = columnMapping.find(m => m.sourceColumn === col);
              return (
                <div key={col} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{col}</p>
                    <p className="text-xs text-gray-500">Colonne source</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex-1">
                    <select
                      value={mapping?.targetField || ''}
                      onChange={e => updateMapping(col, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">-- Ignorer --</option>
                      {targetFields.map(field => (
                        <option key={field.id} value={field.id}>
                          {field.label} {field.required && '*'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle size={20} className="text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">
                  {validationErrors.length} erreur(s) détectée(s)
                </h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>
                    {err.row > 0 ? `Ligne ${err.row}: ` : ''}
                    {err.message}
                  </li>
                ))}
                {validationErrors.length > 5 && (
                  <li>... et {validationErrors.length - 5} autres erreurs</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Retour
            </Button>
            <Button variant="primary" onClick={handleValidate}>
              Valider le mapping
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Check size={20} className="text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Données validées</h4>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{parsedData.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valides</p>
              <p className="text-2xl font-bold text-green-600">
                {parsedData.length - validationErrors.length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Erreurs</p>
              <p className="text-2xl font-bold text-red-600">{validationErrors.length}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              L'import va être soumis pour validation par un manager avant ingestion dans la base de données.
            </p>
            <p className="text-xs text-gray-500">
              Vous recevrez une notification une fois l'import validé ou rejeté.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              leftIcon={<Check size={16} />}
            >
              Soumettre l'import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
