import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Building,
  CreditCard,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DocumentInfo {
  file_name: string;
  file_url: string;
  upload_date: string;
  expiry_date?: string;
  verified: boolean;
  verified_by?: string;
  verified_date?: string;
  admin_validated: boolean;
  admin_validated_by?: string;
  admin_validated_date?: string;
  validation_notes?: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'pending_verification';
}

interface BusinessProviderFormData {
  // Informations personnelles
  type: 'individual' | 'company';
  first_name: string;
  last_name: string;
  company_name?: string;
  siret?: string;
  email: string;
  phone: string;
  address: string;

  // Configuration
  commission_rate: number;
  status: 'active' | 'inactive';

  // Documents obligatoires
  documents: {
    identity: DocumentInfo | null; // Pièce d'identité (obligatoire pour tous)
    kbis?: DocumentInfo | null; // K-bis (si entreprise)
    partnership_agreement: DocumentInfo | null; // Convention de partenariat
  };

  // Informations bancaires
  banking: {
    iban: string;
    bic: string;
    account_holder: string;
  };

  // Vérification
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
}

interface BusinessProviderFormProps {
  onSubmit: (data: BusinessProviderFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BusinessProviderFormData>;
  isLoading?: boolean;
  currentUserRole?: string;
}

const DocumentUpload: React.FC<{
  label: string;
  document: DocumentInfo | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onVerify: () => void;
  onAdminValidate: (notes?: string) => void;
  currentUser?: { role: string; firstName: string; lastName: string };
  required?: boolean;
  acceptedTypes?: string;
}> = ({
  label,
  document,
  onUpload,
  onRemove,
  onVerify,
  onAdminValidate,
  currentUser,
  required = false,
  acceptedTypes = '.pdf,image/*',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      onUpload(file);
    } else {
      alert('Seuls les fichiers PDF et images sont acceptés');
    }
  };

  const handleAdminValidation = () => {
    onAdminValidate(validationNotes);
    setShowValidationModal(false);
    setValidationNotes('');
  };

  const canValidate = currentUser && ['admin', 'manager'].includes(currentUser.role);

  const getStatusIcon = () => {
    if (!document) return null;

    switch (document.status) {
      case 'valid':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'expired':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'expiring_soon':
        return <Clock className="text-amber-600" size={20} />;
      case 'pending_verification':
        return <Clock className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!document) return null;

    switch (document.status) {
      case 'valid':
        return 'Vérifié et valide';
      case 'expired':
        return 'Expiré';
      case 'expiring_soon':
        return 'Expire bientôt';
      case 'pending_verification':
        return 'En attente de vérification';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {document && (
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-xs text-gray-600">{getStatusText()}</span>
          </div>
        )}
      </div>

      {document ? (
        <>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{document.file_name}</p>
                  <p className="text-xs text-gray-500">
                    Téléchargé le {new Date(document.upload_date).toLocaleDateString('fr-FR')}
                  </p>
                  {document.verified && document.verified_by && (
                    <p className="text-xs text-green-600">
                      Vérifié par {document.verified_by} le{' '}
                      {new Date(document.verified_date!).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {document.admin_validated && document.admin_validated_by && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-green-700 font-medium">
                        ✅ Validé par {document.admin_validated_by} le{' '}
                        {new Date(document.admin_validated_date!).toLocaleDateString('fr-FR')}
                      </p>
                      {document.validation_notes && (
                        <p className="text-xs text-green-600 mt-1">
                          Note: {document.validation_notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!document.verified && (
                  <Button type="button" variant="outline" size="sm" onClick={onVerify}>
                    Vérifier
                  </Button>
                )}
                {document.verified && !document.admin_validated && canValidate && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowValidationModal(true)}
                  >
                    Valider
                  </Button>
                )}
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Modal de validation administrative */}
          {showValidationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Validation administrative
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vous vous apprêtez à valider le document "{document.file_name}". Cette action
                  confirme que le document est conforme et accepté.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes de validation (optionnel)
                  </label>
                  <textarea
                    value={validationNotes}
                    onChange={e => setValidationNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Commentaires sur la validation..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowValidationModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="button" variant="primary" onClick={handleAdminValidation}>
                    Valider le document
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Glissez-déposez votre fichier ici ou{' '}
            <label className="text-primary-600 hover:text-primary-500 cursor-pointer">
              parcourez
              <input
                type="file"
                className="hidden"
                accept={acceptedTypes}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">PDF ou image (max 10MB)</p>
        </div>
      )}
    </div>
  );
};

export const BusinessProviderForm: React.FC<BusinessProviderFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  currentUserRole = 'admin',
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BusinessProviderFormData>({
    defaultValues: {
      type: initialData?.type || 'individual',
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      company_name: initialData?.company_name || '',
      siret: initialData?.siret || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      commission_rate: initialData?.commission_rate || 10,
      status: initialData?.status || 'active',
      documents: initialData?.documents || {
        identity: null,
        kbis: null,
        partnership_agreement: null,
      },
      banking: initialData?.banking || {
        iban: '',
        bic: '',
        account_holder: '',
      },
      verification_status: initialData?.verification_status || 'pending',
    },
  });

  const providerType = watch('type');

  const handleDocumentUpload = (
    documentType: keyof BusinessProviderFormData['documents'],
    file: File
  ) => {
    const documentInfo: DocumentInfo = {
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      upload_date: new Date().toISOString(),
      verified: false,
      admin_validated: false,
      status: 'pending_verification',
    };

    setValue(`documents.${documentType}`, documentInfo);
  };

  const handleDocumentVerify = (documentType: keyof BusinessProviderFormData['documents']) => {
    const currentDoc = watch(`documents.${documentType}`);
    if (currentDoc) {
      const verifiedDoc: DocumentInfo = {
        ...currentDoc,
        verified: true,
        verified_by: 'Admin',
        verified_date: new Date().toISOString(),
        status: 'valid',
      };
      setValue(`documents.${documentType}`, verifiedDoc);
    }
  };

  const handleDocumentAdminValidate = (
    documentType: keyof BusinessProviderFormData['documents'],
    notes?: string
  ) => {
    const currentDoc = watch(`documents.${documentType}`);
    if (currentDoc) {
      const validatedDoc: DocumentInfo = {
        ...currentDoc,
        admin_validated: true,
        admin_validated_by: 'Jean-Marc Leton',
        admin_validated_date: new Date().toISOString(),
        validation_notes: notes || undefined,
        status: 'valid',
      };
      setValue(`documents.${documentType}`, validatedDoc);
    }
  };

  const handleDocumentRemove = (documentType: keyof BusinessProviderFormData['documents']) => {
    setValue(`documents.${documentType}`, null);
  };

  const currentUser = {
    role: 'admin',
    firstName: 'Jean-Marc',
    lastName: 'Leton',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Type d'apporteur */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type d'apporteur</label>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
            <input type="radio" {...register('type')} value="individual" className="sr-only" />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  <span className="block text-sm font-medium text-gray-900">Particulier</span>
                </span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  Apporteur individuel
                </span>
              </span>
            </span>
            <span
              className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                providerType === 'individual' ? 'border-primary-500' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>

          <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
            <input type="radio" {...register('type')} value="company" className="sr-only" />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="flex items-center">
                  <Building className="mr-2 text-green-600" size={20} />
                  <span className="block text-sm font-medium text-gray-900">
                    Entreprise partenaire
                  </span>
                </span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  Entreprise du bâtiment
                </span>
              </span>
            </span>
            <span
              className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                providerType === 'company' ? 'border-primary-500' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Les entreprises (partenaires du bâtiment ou autres) peuvent également être apporteurs
          d'affaires
        </p>
      </div>

      {/* Informations personnelles/entreprise */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {providerType === 'individual'
            ? 'Informations personnelles'
            : "Informations de l'entreprise"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providerType === 'individual' ? (
            <>
              <Input
                label="Prénom"
                {...register('first_name', { required: 'Le prénom est requis' })}
                error={errors.first_name?.message}
              />
              <Input
                label="Nom"
                {...register('last_name', { required: 'Le nom est requis' })}
                error={errors.last_name?.message}
              />
            </>
          ) : (
            <>
              <Input
                label="Nom de l'entreprise"
                {...register('company_name', { required: "Le nom de l'entreprise est requis" })}
                error={errors.company_name?.message}
              />
              <Input
                label="SIRET"
                {...register('siret', {
                  required: 'Le SIRET est requis pour les entreprises',
                  pattern: {
                    value: /^\d{14}$/,
                    message: 'Le numéro SIRET doit contenir 14 chiffres',
                  },
                })}
                error={errors.siret?.message}
              />
              <Input
                label="Prénom du représentant"
                {...register('first_name', { required: 'Le prénom du représentant est requis' })}
                error={errors.first_name?.message}
              />
              <Input
                label="Nom du représentant"
                {...register('last_name', { required: 'Le nom du représentant est requis' })}
                error={errors.last_name?.message}
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: "L'email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide',
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Téléphone"
            {...register('phone', { required: 'Le téléphone est requis' })}
            error={errors.phone?.message}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Adresse complète"
            {...register('address', { required: "L'adresse est requise" })}
            error={errors.address?.message}
          />
        </div>
      </div>

      {/* Configuration */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Taux de commission (%)"
            type="number"
            {...register('commission_rate', {
              required: 'Le taux de commission est requis',
              min: { value: 0, message: 'Le taux doit être positif' },
              max: { value: 50, message: 'Le taux ne peut pas dépasser 50%' },
            })}
            error={errors.commission_rate?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              {...register('status')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de vérification
            </label>
            <select
              {...register('verification_status')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              disabled={!initialData}
            >
              <option value="pending">Non effectuée</option>
              <option value="verified">Apporteur vérifié ✓</option>
              <option value="rejected">Vérification rejetée</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {!initialData
                ? 'La vérification sera effectuée après la création'
                : "Statut de la vérification de l'apporteur"}
            </p>
          </div>
        </div>
      </div>

      {/* Informations bancaires */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations bancaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="IBAN"
            {...register('banking.iban', { required: "L'IBAN est requis" })}
            error={errors.banking?.iban?.message}
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            leftIcon={<CreditCard size={18} className="text-gray-400" />}
          />

          <Input
            label="BIC/SWIFT"
            {...register('banking.bic', { required: 'Le BIC est requis' })}
            error={errors.banking?.bic?.message}
            placeholder="BNPAFRPP"
          />

          <Input
            label="Titulaire du compte"
            {...register('banking.account_holder', { required: 'Le titulaire est requis' })}
            error={errors.banking?.account_holder?.message}
            placeholder="Nom du titulaire"
          />
        </div>
      </div>

      {/* Documents obligatoires */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Documents obligatoires</h2>

        {/* Indicateur de statut global */}
        <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {watch('verification_status') === 'verified' ? (
                <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                  <CheckCircle size={20} className="mr-2" />
                  <span className="font-medium">Apporteur vérifié</span>
                </div>
              ) : watch('verification_status') === 'rejected' ? (
                <div className="flex items-center text-red-700 bg-red-50 px-3 py-2 rounded-full border border-red-200">
                  <AlertTriangle size={20} className="mr-2" />
                  <span className="font-medium">Vérification rejetée</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-full border border-amber-200">
                  <Clock size={20} className="mr-2" />
                  <span className="font-medium">
                    {!initialData ? 'Vérification non effectuée' : 'En attente de vérification'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Statut des documents</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex space-x-1">
                  {[
                    watch('documents.identity'),
                    providerType === 'company' ? watch('documents.kbis') : null,
                    watch('documents.partnership_agreement'),
                  ]
                    .filter(Boolean)
                    .map((doc, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          doc?.admin_validated
                            ? 'bg-green-500'
                            : doc?.verified
                              ? 'bg-amber-500'
                              : doc
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                        }`}
                        title={
                          doc?.admin_validated
                            ? 'Validé'
                            : doc?.verified
                              ? 'Vérifié'
                              : doc
                                ? 'Téléchargé'
                                : 'Manquant'
                        }
                      />
                    ))}
                </div>
                <span className="text-xs text-gray-500">
                  {
                    [
                      watch('documents.identity'),
                      providerType === 'company' ? watch('documents.kbis') : null,
                      watch('documents.partnership_agreement'),
                    ].filter(doc => doc?.admin_validated).length
                  }
                  /{providerType === 'company' ? 3 : 2} validés
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pièce d'identité (obligatoire pour tous) */}
          <DocumentUpload
            label={
              providerType === 'individual'
                ? "Pièce d'identité (CNI, Passeport)"
                : "Pièce d'identité du représentant légal"
            }
            document={watch('documents.identity')}
            onUpload={file => handleDocumentUpload('identity', file)}
            onRemove={() => handleDocumentRemove('identity')}
            onVerify={() => handleDocumentVerify('identity')}
            onAdminValidate={notes => handleDocumentAdminValidate('identity', notes)}
            currentUser={currentUser}
            required={true}
            acceptedTypes="image/*,.pdf"
          />

          {/* K-bis (uniquement pour les entreprises) */}
          {providerType === 'company' && (
            <DocumentUpload
              label="K-bis (moins de 3 mois)"
              document={watch('documents.kbis')}
              onUpload={file => handleDocumentUpload('kbis', file)}
              onRemove={() => handleDocumentRemove('kbis')}
              onVerify={() => handleDocumentVerify('kbis')}
              onAdminValidate={notes => handleDocumentAdminValidate('kbis', notes)}
              currentUser={currentUser}
              required={true}
            />
          )}

          {/* Convention de partenariat */}
          <DocumentUpload
            label="Convention d'apporteur d'affaires signée"
            document={watch('documents.partnership_agreement')}
            onUpload={file => handleDocumentUpload('partnership_agreement', file)}
            onRemove={() => handleDocumentRemove('partnership_agreement')}
            onVerify={() => handleDocumentVerify('partnership_agreement')}
            onAdminValidate={notes => handleDocumentAdminValidate('partnership_agreement', notes)}
            currentUser={currentUser}
            required={true}
          />
        </div>
      </div>

      {/* Notes de vérification */}
      {initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes de vérification
          </label>
          <textarea
            {...register('verification_notes')}
            rows={3}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Notes internes sur la vérification de l'apporteur..."
          />
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Mettre à jour' : "Créer l'apporteur"}
        </Button>
      </div>
    </form>
  );
};
