import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CONSTRUCTION_ACTIVITIES, INTELLECTUAL_SERVICES } from '../../config/activities';
import { TerritoryMap } from './TerritoryMap';
import { LogoUpload } from './LogoUpload';

interface CompanyFormData {
  name: string;
  type: string;
  company_category: 'construction_partner' | 'service_provider';
  email: string;
  phone: string;
  address: string;
  siret: string;
  activities: string[];
  intellectual_services: string[];
  description?: string;
  territory: {
    center: {
      lat: number;
      lng: number;
    };
    radius: number;
  };
  logo?: {
    url: string;
    alt: string;
  };
  documents: {
    identity: DocumentInfo | null;
    kbis: DocumentInfo | null;
    insurance: DocumentInfo | null;
    partnership_agreement: DocumentInfo | null;
  };
  payment_status: 'up_to_date' | 'pending' | 'overdue';
  verification_status: 'pending' | 'verified' | 'rejected';
  rating: {
    overall: number;
    quality: number;
    reliability: number;
    communication: number;
    last_updated: string;
  };
}

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

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  initialData?: Partial<CompanyFormData>;
  isLoading?: boolean;
  currentUserRole?: string;
}

const ActivityAccordion: React.FC<{
  title: string;
  activities: Array<{ id: string; name: string }>;
  selectedActivities: string[];
  onActivityToggle: (activityId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ title, activities, selectedActivities, onActivityToggle, isExpanded, onToggle }) => {
  const selectedCount = activities.filter(activity =>
    selectedActivities.includes(activity.id)
  ).length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-900">{title}</span>
          {selectedCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="text-gray-500" size={20} />
        ) : (
          <ChevronRight className="text-gray-500" size={20} />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activities.map(activity => (
              <label
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0 pt-1">
                  <div
                    className={`w-5 h-5 rounded border ${
                      selectedActivities.includes(activity.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300'
                    } flex items-center justify-center`}
                  >
                    {selectedActivities.includes(activity.id) && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1" onClick={() => onActivityToggle(activity.id)}>
                  <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                  <span className="text-xs text-gray-500 block">Code {activity.id}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DocumentUpload: React.FC<{
  label: string;
  document: DocumentInfo | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onVerify: () => void;
  onAdminValidate: (notes?: string) => void;
  currentUser?: { role: string; firstName: string; lastName: string };
  hasExpiryDate?: boolean;
  required?: boolean;
}> = ({
  label,
  document,
  onUpload,
  onRemove,
  onVerify,
  onAdminValidate,
  currentUser,
  hasExpiryDate = false,
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
                  {document.expiry_date && (
                    <p className="text-xs text-gray-500">
                      Expire le {new Date(document.expiry_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
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
                  {document.verified && !document.admin_validated && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-700">
                        ⏳ En attente de validation administrative
                      </p>
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
                {document.admin_validated && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Validé ✓
                  </span>
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
                accept=".pdf,image/*"
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

const RatingSection: React.FC<{
  rating: CompanyFormData['rating'];
  onRatingChange: (field: keyof CompanyFormData['rating'], value: number) => void;
}> = ({ rating, onRatingChange }) => {
  const StarRating: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
  }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Notation de l'entreprise</h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <StarRating
          label="Note globale"
          value={rating.overall}
          onChange={value => onRatingChange('overall', value)}
        />
        <StarRating
          label="Qualité des travaux"
          value={rating.quality}
          onChange={value => onRatingChange('quality', value)}
        />
        <StarRating
          label="Fiabilité"
          value={rating.reliability}
          onChange={value => onRatingChange('reliability', value)}
        />
        <StarRating
          label="Communication"
          value={rating.communication}
          onChange={value => onRatingChange('communication', value)}
        />
      </div>
    </div>
  );
};

export const CompanyForm: React.FC<CompanyFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  currentUserRole = 'admin', // Par défaut admin pour les tests
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['construction']);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    initialData?.activities || []
  );
  const [selectedIntellectualServices, setSelectedIntellectualServices] = useState<string[]>(
    initialData?.intellectual_services || []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CompanyFormData>({
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
      company_category: initialData?.company_category || 'construction_partner',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      siret: initialData?.siret || '',
      activities: initialData?.activities || [],
      intellectual_services: initialData?.intellectual_services || [],
      description: initialData?.description || '',
      territory: initialData?.territory || {
        center: { lat: 46.603354, lng: 1.888334 },
        radius: 50,
      },
      logo: initialData?.logo,
      documents: initialData?.documents || {
        identity: null,
        kbis: null,
        insurance: null, // RC Pro pour fournisseurs, décennale pour construction
        partnership_agreement: null,
      },
      payment_status: initialData?.payment_status || 'up_to_date',
      verification_status: initialData?.verification_status || 'pending',
      rating: initialData?.rating || {
        overall: 0,
        quality: 0,
        reliability: 0,
        communication: 0,
        last_updated: new Date().toISOString(),
      },
    },
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(current =>
      current.includes(sectionId) ? current.filter(id => id !== sectionId) : [...current, sectionId]
    );
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(current => {
      const updated = current.includes(activityId)
        ? current.filter(id => id !== activityId)
        : [...current, activityId];
      setValue('activities', updated);
      return updated;
    });
  };

  const handleIntellectualServiceToggle = (serviceId: string) => {
    setSelectedIntellectualServices(current => {
      const updated = current.includes(serviceId)
        ? current.filter(id => id !== serviceId)
        : [...current, serviceId];
      setValue('intellectual_services', updated);
      return updated;
    });
  };

  const handleDocumentUpload = (documentType: keyof CompanyFormData['documents'], file: File) => {
    const documentInfo: DocumentInfo = {
      file_name: file.name,
      file_url: URL.createObjectURL(file), // En production, upload vers le serveur
      upload_date: new Date().toISOString(),
      verified: false,
      status: 'pending_verification',
    };

    setValue(`documents.${documentType}`, documentInfo);
  };

  const handleDocumentVerify = (documentType: keyof CompanyFormData['documents']) => {
    const currentDoc = watch(`documents.${documentType}`);
    if (currentDoc) {
      const verifiedDoc: DocumentInfo = {
        ...currentDoc,
        verified: true,
        verified_by: 'Admin', // En production, utiliser l'utilisateur connecté
        verified_date: new Date().toISOString(),
        admin_validated: false, // Nécessite une validation séparée
        status: 'valid',
      };
      setValue(`documents.${documentType}`, verifiedDoc);
    }
  };

  const handleDocumentAdminValidate = (
    documentType: keyof CompanyFormData['documents'],
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
  const handleDocumentRemove = (documentType: keyof CompanyFormData['documents']) => {
    setValue(`documents.${documentType}`, null);
  };

  const handleRatingChange = (field: keyof CompanyFormData['rating'], value: number) => {
    setValue(`rating.${field}`, value);
    setValue('rating.last_updated', new Date().toISOString());
  };

  const handleFormSubmit = (data: CompanyFormData) => {
    const formData = {
      ...data,
      activities: selectedActivities,
      intellectual_services: selectedIntellectualServices,
    };
    onSubmit(formData);
  };

  // Utilisateur actuel pour les validations (en production, récupérer depuis le store)
  const currentUser = {
    role: 'admin',
    firstName: 'Jean-Marc',
    lastName: 'Leton',
  };
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Restriction d'accès pour les fournisseurs de services */}
      {watch('company_category') === 'service_provider' && currentUserRole !== 'admin' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Accès restreint</h3>
              <p className="mt-1 text-sm text-red-700">
                Seuls les administrateurs peuvent gérer les fournisseurs de services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations générales */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie d'entreprise
              {currentUserRole !== 'admin' && (
                <span className="ml-2 text-xs text-gray-500">
                  (Fournisseurs de services : accès administrateur requis)
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                <input
                  type="radio"
                  {...register('company_category')}
                  value="construction_partner"
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      Entreprise du bâtiment
                    </span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">
                      Partenaire construction
                    </span>
                  </span>
                </span>
                <span
                  className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                    watch('company_category') === 'construction_partner'
                      ? 'border-primary-500'
                      : 'border-transparent'
                  }`}
                  aria-hidden="true"
                />
              </label>

              <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                <input
                  type="radio"
                  {...register('company_category')}
                  value="service_provider"
                  className="sr-only"
                  disabled={currentUserRole !== 'admin'}
                />
                <span className={`flex flex-1 ${currentUserRole !== 'admin' ? 'opacity-50' : ''}`}>
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      Fournisseur de services
                    </span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">
                      Assurance, financement, immobilier
                      {currentUserRole !== 'admin' && (
                        <span className="ml-2 text-xs text-red-500">(Admin uniquement)</span>
                      )}
                    </span>
                  </span>
                </span>
                <span
                  className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                    watch('company_category') === 'service_provider' && currentUserRole === 'admin'
                      ? 'border-primary-500'
                      : 'border-transparent'
                  }`}
                  aria-hidden="true"
                />
              </label>
            </div>

            {currentUserRole !== 'admin' && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note :</strong> Les fournisseurs de services (assurance, financement,
                  immobilier) ne peuvent être gérés que par les administrateurs. Leurs services
                  seront proposés aux clients et partenaires via l'interface.
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <LogoUpload
              companyId={initialData?.id || ''}
              currentLogo={watch('logo')}
              onLogoUpdate={logoData => setValue('logo', logoData)}
            />
          </div>

          <Input
            label="Nom de l'entreprise"
            {...register('name', { required: 'Le nom est requis' })}
            error={errors.name?.message}
          />

          <Input
            label="Type d'entreprise"
            {...register('type', { required: 'Le type est requis' })}
            error={errors.type?.message}
            placeholder="SARL, SAS, etc."
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
          />

          <Input label="Téléphone" {...register('phone')} error={errors.phone?.message} />

          <Input
            label="SIRET"
            {...register('siret', {
              pattern: {
                value: /^\d{14}$/,
                message: 'Le numéro SIRET doit contenir 14 chiffres',
              },
            })}
            error={errors.siret?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de vérification
            </label>
            <select
              {...register('verification_status')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              disabled={!initialData} // Désactivé en création, modifiable en édition
            >
              <option value="pending">Non effectuée</option>
              <option value="verified">Entreprise vérifiée ✓</option>
              <option value="rejected">Vérification rejetée</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {!initialData
                ? 'La vérification sera effectuée après la création'
                : "Statut de la vérification administrative de l'entreprise"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de paiement
            </label>
            <select
              {...register('payment_status')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="up_to_date">À jour</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <Input label="Adresse" {...register('address')} error={errors.address?.message} />
      </div>

      {/* Zone de territorialité */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Zone de territorialité</h2>
        <Controller
          name="territory"
          control={control}
          render={({ field }) => (
            <TerritoryMap
              address={{
                street: watch('address'),
                city: '',
                postalCode: '',
              }}
              territory={field.value}
              onTerritoryChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Activités avec accordéons */}
      {watch('company_category') === 'construction_partner' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Activités du bâtiment</h2>
          <div className="space-y-4">
            {/* Activités de construction */}
            {Object.entries(CONSTRUCTION_ACTIVITIES).map(([categoryKey, category]) => (
              <ActivityAccordion
                key={categoryKey}
                title={category.title}
                activities={category.activities}
                selectedActivities={selectedActivities}
                onActivityToggle={handleActivityToggle}
                isExpanded={expandedSections.includes(categoryKey)}
                onToggle={() => toggleSection(categoryKey)}
              />
            ))}

            {/* Services intellectuels */}
            {Object.entries(INTELLECTUAL_SERVICES).map(([categoryKey, category]) => (
              <ActivityAccordion
                key={`intellectual-${categoryKey}`}
                title={category.title}
                activities={category.services}
                selectedActivities={selectedIntellectualServices}
                onActivityToggle={handleIntellectualServiceToggle}
                isExpanded={expandedSections.includes(`intellectual-${categoryKey}`)}
                onToggle={() => toggleSection(`intellectual-${categoryKey}`)}
              />
            ))}
          </div>
        </div>
      )}

      {watch('company_category') === 'service_provider' && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Services proposés</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('insurance')}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Services d'assurance</span>
                  {selectedActivities.filter(id => id.startsWith('INS')).length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {selectedActivities.filter(id => id.startsWith('INS')).length} sélectionnée
                      {selectedActivities.filter(id => id.startsWith('INS')).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {expandedSections.includes('insurance') ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </button>

              {expandedSections.includes('insurance') && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'INS001', name: 'Assurance dommages-ouvrage' },
                      { id: 'INS002', name: 'Assurance tous risques chantier' },
                      { id: 'INS003', name: 'Assurance responsabilité civile' },
                      { id: 'INS004', name: 'Assurance décennale' },
                      { id: 'INS005', name: 'Protection juridique' },
                      { id: 'INS006', name: 'Assurance matériel de chantier' },
                    ].map(service => (
                      <label
                        key={service.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              selectedActivities.includes(service.id)
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {selectedActivities.includes(service.id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1" onClick={() => handleActivityToggle(service.id)}>
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('financing')}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Services de financement</span>
                  {selectedActivities.filter(id => id.startsWith('FIN')).length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {selectedActivities.filter(id => id.startsWith('FIN')).length} sélectionnée
                      {selectedActivities.filter(id => id.startsWith('FIN')).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {expandedSections.includes('financing') ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </button>

              {expandedSections.includes('financing') && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'FIN001', name: 'Prêts travaux classiques' },
                      { id: 'FIN002', name: 'Éco-prêt à taux zéro' },
                      { id: 'FIN003', name: 'Prêts rénovation énergétique' },
                      { id: 'FIN004', name: 'Crédit-bail immobilier' },
                      { id: 'FIN005', name: 'Financement participatif' },
                      { id: 'FIN006', name: 'Leasing équipements' },
                    ].map(service => (
                      <label
                        key={service.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              selectedActivities.includes(service.id)
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {selectedActivities.includes(service.id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1" onClick={() => handleActivityToggle(service.id)}>
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('real_estate')}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Services immobiliers</span>
                  {selectedActivities.filter(id => id.startsWith('IMM')).length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {selectedActivities.filter(id => id.startsWith('IMM')).length} sélectionnée
                      {selectedActivities.filter(id => id.startsWith('IMM')).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {expandedSections.includes('real_estate') ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </button>

              {expandedSections.includes('real_estate') && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'IMM001', name: 'Expertise immobilière' },
                      { id: 'IMM002', name: 'Gestion de patrimoine' },
                      { id: 'IMM003', name: 'Transaction immobilière' },
                      { id: 'IMM004', name: 'Syndic de copropriété' },
                      { id: 'IMM005', name: 'Administration de biens' },
                      { id: 'IMM006', name: 'Conseil en investissement' },
                    ].map(service => (
                      <label
                        key={service.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              selectedActivities.includes(service.id)
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {selectedActivities.includes(service.id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1" onClick={() => handleActivityToggle(service.id)}>
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('other_services')}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Autres services</span>
                  {selectedActivities.filter(id => id.startsWith('AUT')).length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {selectedActivities.filter(id => id.startsWith('AUT')).length} sélectionnée
                      {selectedActivities.filter(id => id.startsWith('AUT')).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {expandedSections.includes('other_services') ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </button>

              {expandedSections.includes('other_services') && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'AUT001', name: 'Services juridiques' },
                      { id: 'AUT002', name: 'Notariat' },
                      { id: 'AUT003', name: 'Expertise comptable' },
                      { id: 'AUT004', name: 'Conseil fiscal' },
                      { id: 'AUT005', name: 'Formation professionnelle' },
                      { id: 'AUT006', name: 'Certification qualité' },
                    ].map(service => (
                      <label
                        key={service.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded border ${
                              selectedActivities.includes(service.id)
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {selectedActivities.includes(service.id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1" onClick={() => handleActivityToggle(service.id)}>
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Documents obligatoires</h2>

        {/* Indicateur de statut global */}
        <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {watch('verification_status') === 'verified' ? (
                <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                  <CheckCircle size={20} className="mr-2" />
                  <span className="font-medium">Entreprise vérifiée</span>
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
                    watch('documents.kbis'),
                    watch('documents.insurance'),
                    watch('documents.partnership_agreement'),
                  ].map((doc, index) => (
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
                      watch('documents.kbis'),
                      watch('documents.insurance'),
                      watch('documents.partnership_agreement'),
                    ].filter(doc => doc?.admin_validated).length
                  }
                  /4 validés
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <DocumentUpload
            label="Pièce d'identité du représentant légal (CNI, Passeport)"
            document={watch('documents.identity')}
            onUpload={file => handleDocumentUpload('identity', file)}
            onRemove={() => handleDocumentRemove('identity')}
            onVerify={() => handleDocumentVerify('identity')}
            onAdminValidate={notes => handleDocumentAdminValidate('identity', notes)}
            currentUser={currentUser}
            required={true}
          />

          <DocumentUpload
            label="K-bis (moins de 3 mois)"
            document={watch('documents.kbis')}
            onUpload={file => handleDocumentUpload('kbis', file)}
            onRemove={() => handleDocumentRemove('kbis')}
            onVerify={() => handleDocumentVerify('kbis')}
            onAdminValidate={notes => handleDocumentAdminValidate('kbis', notes)}
            currentUser={currentUser}
            hasExpiryDate={true}
            required={true}
          />

          <DocumentUpload
            label={
              watch('company_category') === 'construction_partner'
                ? "Attestation d'assurance décennale"
                : "Attestation d'assurance responsabilité civile professionnelle"
            }
            document={watch('documents.insurance')}
            onUpload={file => handleDocumentUpload('insurance', file)}
            onRemove={() => handleDocumentRemove('insurance')}
            onVerify={() => handleDocumentVerify('insurance')}
            onAdminValidate={notes => handleDocumentAdminValidate('insurance', notes)}
            currentUser={currentUser}
            hasExpiryDate={true}
            required={true}
          />

          <DocumentUpload
            label="Convention de partenariat signée"
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

      {/* Notation */}
      <RatingSection rating={watch('rating')} onRatingChange={handleRatingChange} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Description détaillée de l'entreprise..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData
            ? 'Mettre à jour'
            : currentUserRole === 'mandatary'
              ? "Proposer l'entreprise"
              : "Créer l'entreprise"}
        </Button>
      </div>
    </form>
  );
};
