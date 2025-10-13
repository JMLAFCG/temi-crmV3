import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserRole } from '../../types';

interface DocumentInfo {
  file_name: string;
  file_url: string;
  upload_date: string;
  verified: boolean;
  verified_by?: string;
  verified_date?: string;
  admin_validated: boolean;
  admin_validated_by?: string;
  admin_validated_date?: string;
  validation_notes?: string;
  status: 'valid' | 'expired' | 'pending_verification';
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  company_id?: string;

  // Document obligatoire pour tous
  identity_document: DocumentInfo | null;

  // Statut de vérification
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  initialData?: Partial<UserFormData>;
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
}> = ({
  label,
  document,
  onUpload,
  onRemove,
  onVerify,
  onAdminValidate,
  currentUser,
  required = false,
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
            Glissez-déposez votre pièce d'identité ici ou{' '}
            <label className="text-primary-600 hover:text-primary-500 cursor-pointer">
              parcourez
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">CNI, Passeport (PDF ou image, max 10MB)</p>
        </div>
      )}
    </div>
  );
};

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  currentUserRole = 'admin',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      role: initialData?.role || 'client',
      company_id: initialData?.company_id || '',
      identity_document: initialData?.identity_document || null,
      verification_status: initialData?.verification_status || 'pending',
    },
  });

  const handleDocumentUpload = (file: File) => {
    const documentInfo: DocumentInfo = {
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      upload_date: new Date().toISOString(),
      verified: false,
      admin_validated: false,
      status: 'pending_verification',
    };

    setValue('identity_document', documentInfo);
  };

  const handleDocumentVerify = () => {
    const currentDoc = watch('identity_document');
    if (currentDoc) {
      const verifiedDoc: DocumentInfo = {
        ...currentDoc,
        verified: true,
        verified_by: 'Admin',
        verified_date: new Date().toISOString(),
        status: 'valid',
      };
      setValue('identity_document', verifiedDoc);
    }
  };

  const handleDocumentAdminValidate = (notes?: string) => {
    const currentDoc = watch('identity_document');
    if (currentDoc) {
      const validatedDoc: DocumentInfo = {
        ...currentDoc,
        admin_validated: true,
        admin_validated_by: 'Jean-Marc Leton',
        admin_validated_date: new Date().toISOString(),
        validation_notes: notes || undefined,
        status: 'valid',
      };
      setValue('identity_document', validatedDoc);
    }
  };

  const handleDocumentRemove = () => {
    setValue('identity_document', null);
  };

  const currentUser = {
    role: 'admin',
    firstName: 'Jean-Marc',
    lastName: 'Leton',
  };

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrateur',
    manager: 'Gestionnaire',
    commercial: 'Commercial',
    mandatary: 'Mandataire',
    business_provider: "Apporteur d'affaires",
    client: 'Client',
    partner_company: 'Entreprise partenaire',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Informations personnelles */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Prénom"
            {...register('first_name', { required: 'Le prénom est requis' })}
            error={errors.first_name?.message}
            leftIcon={<User size={18} className="text-gray-400" />}
          />

          <Input
            label="Nom"
            {...register('last_name', { required: 'Le nom est requis' })}
            error={errors.last_name?.message}
            leftIcon={<User size={18} className="text-gray-400" />}
          />

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
            leftIcon={<Mail size={18} className="text-gray-400" />}
          />

          <Input
            label="Téléphone"
            {...register('phone')}
            error={errors.phone?.message}
            leftIcon={<Phone size={18} className="text-gray-400" />}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Adresse"
            {...register('address')}
            error={errors.address?.message}
            leftIcon={<MapPin size={18} className="text-gray-400" />}
          />
        </div>
      </div>

      {/* Rôle et permissions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Rôle et permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <div className="relative">
              <select
                {...register('role', { required: 'Le rôle est requis' })}
                className="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield size={18} className="text-gray-400" />
              </div>
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
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
              <option value="verified">Utilisateur vérifié ✓</option>
              <option value="rejected">Vérification rejetée</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {!initialData
                ? 'La vérification sera effectuée après la création'
                : "Statut de la vérification de l'utilisateur"}
            </p>
          </div>
        </div>
      </div>

      {/* Document d'identité obligatoire */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Document d'identité</h2>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Document obligatoire</h3>
              <p className="mt-1 text-sm text-blue-700">
                Tous les utilisateurs doivent fournir une pièce d'identité valide (CNI, Passeport).
              </p>
            </div>
          </div>
        </div>

        <DocumentUpload
          label="Pièce d'identité (CNI, Passeport)"
          document={watch('identity_document')}
          onUpload={handleDocumentUpload}
          onRemove={handleDocumentRemove}
          onVerify={handleDocumentVerify}
          onAdminValidate={handleDocumentAdminValidate}
          currentUser={currentUser}
          required={true}
        />
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
            placeholder="Notes internes sur la vérification de l'utilisateur..."
          />
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Mettre à jour' : "Créer l'utilisateur"}
        </Button>
      </div>
    </form>
  );
};
