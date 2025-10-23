

// src/components/projects/ProjectWizardForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Camera,
  FileText,
  MapPin,
  Euro,
  Calendar,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Users,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ClientSelector } from '../clients/ClientSelector';
import { LocationSelector } from './LocationSelector';
import { ActivitySelector } from './ActivitySelector';
import { PhotoManager } from './PhotoManager';
import { CompanySelector } from './CompanySelector';
import { SignaturePad } from './SignaturePad';
import { BusinessProviderSelector } from './BusinessProviderSelector';
import { AgentSelector } from './AgentSelector';
import { Photo } from '../../types';
import { useSearchParams } from 'react-router-dom'; // ⬅️ pour pré-sélection client depuis l’URL

interface ProjectWizardFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const steps = [
  { id: 'client',    title: 'Client',               description: 'Informations du client',           icon: <FileText size={24} /> },
  { id: 'team',      title: 'Équipe',               description: 'Mandataire et apporteur',          icon: <Users size={24} /> },
  { id: 'location',  title: 'Localisation',         description: 'Adresse du projet',                icon: <MapPin size={24} /> },
  { id: 'type',      title: 'Type de projet',       description: 'Nature des travaux',               icon: <FileText size={24} /> },
  { id: 'activities',title: 'Activités',            description: 'Corps de métiers',                 icon: <FileText size={24} /> },
  { id: 'budget',    title: 'Budget',               description: 'Estimation financière',            icon: <Euro size={24} /> },
  { id: 'timeline',  title: 'Planning',             description: 'Délais souhaités',                 icon: <Calendar size={24} /> },
  { id: 'photos',    title: 'Photos & Documents',   description: 'Upload des documents',             icon: <Camera size={24} /> },
  { id: 'companies', title: 'Entreprises',          description: 'Sélection des prestataires',       icon: <FileText size={24} /> },
  { id: 'consent',   title: 'Validation',           description: 'Signature du mandat',              icon: <CheckSquare size={24} /> },
];

const TYPE_OPTIONS = [
  { value: 'construction', label: 'Construction neuve' },
  { value: 'renovation',   label: 'Rénovation' },
  { value: 'extension',    label: 'Extension' },
  { value: 'amenagement',  label: 'Aménagement' },
];

const OBJECTIVE_OPTIONS = [
  { value: 'residence_principale', label: 'Résidence principale' },
  { value: 'residence_secondaire', label: 'Résidence secondaire' },
  { value: 'location',             label: 'Location' },
  { value: 'revente',              label: 'Revente' },
];

export const ProjectWizardForm: React.FC<ProjectWizardFormProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchParams] = useSearchParams(); // ⬅️

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      client_id: '',
      agent_id: '',
      business_provider_id: '',
      title: '',
      description: '',
      location: {
        address: '',
        city: '',
        postalCode: '',
        details: '',
      },
      project_type: '',
      zones: [],
      objective: '',
      surface: {
        total: 0,
        living: 0,
        work: 0,
      },
      budget: {
        total: 0,
        materials: 0,
        labor: 0,
        services: 0,
      },
      timeline: {
        startDate: '',
        endDate: '',
        estimatedDuration: 0,
      },
      activities: [],
      intellectual_services: [],
      additional_services: [],
      photos: [],
      selectedCompanies: [],
      gdpr_consent: false,
      signature: null,
    },
  });

  // Pré-sélection client depuis l’URL ?client_id=...
  useEffect(() => {
    const cid = searchParams.get('client_id');
    if (cid) {
      setValue('client_id', cid, { shouldDirty: true, shouldValidate: true });
      // on arrive directement sur l’étape suivante si tu veux accélérer :
      // setCurrentStep(1);
    }
  }, [searchParams, setValue]);

  // valeurs "watch" utiles
  const projectType = watch('project_type');
  const projectObjective = watch('objective');
  const materials = watch('budget.materials') as number | undefined;
  const labor = watch('budget.labor') as number | undefined;

  // calcul numérique + synchro du total dans le form
  const totalRaw = (Number(materials) || 0) + (Number(labor) || 0);
  const total = Number.isFinite(totalRaw) ? totalRaw : 0;

  useEffect(() => {
    setValue('budget.total', total, { shouldDirty: true });
  }, [total, setValue]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handlePhotoAdd = (photo: Photo) => {
    const next = [...photos, photo];
    setPhotos(next);
    setValue('photos', next);
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'client':
        return (
          <div className="space-y-6">
            <Controller
              name="client_id"
              control={control}
              rules={{ required: 'Le client est requis' }}
              render={({ field }) => (
                <ClientSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.client_id?.message}
                />
              )}
            />

            <Input
              label="Titre du projet"
              {...register('title', { required: 'Le titre est requis' })}
              error={errors.title?.message}
              placeholder="Ex: Rénovation maison principale"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Description détaillée du projet..."
              />
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Équipe du projet</h4>
              <p className="text-sm text-blue-700">
                Sélectionnez le mandataire qui suivra le projet et l'apporteur d'affaires si
                applicable.
              </p>
            </div>

            <Controller
              name="agent_id"
              control={control}
              rules={{ required: 'Le mandataire est requis' }}
              render={({ field }) => (
                <AgentSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.agent_id?.message}
                />
              )}
            />

            <Controller
              name="business_provider_id"
              control={control}
              render={({ field }) => (
                <BusinessProviderSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.business_provider_id?.message}
                />
              )}
            />
          </div>
        );

      case 'location':
        return (
          <Controller
            name="location"
            control={control}
            rules={{ required: 'La localisation est requise' }}
            render={({ field }) => (
              <LocationSelector
                value={field.value}
                onChange={field.onChange}
                errors={errors.location as any}
              />
            )}
          />
        );

      case 'type':
        // Étape 4 : cartes cliquables + style actif
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Type de projet</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TYPE_OPTIONS.map(opt => {
                  const active = projectType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setValue('project_type', opt.value, { shouldDirty: true, shouldValidate: true })
                      }
                      className={`relative flex cursor-pointer rounded-lg border bg-white p-4 text-left shadow-sm transition
                        ${active ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50'
                                 : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className="font-medium text-gray-900">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* input caché pour la validation RHF */}
              <input type="hidden" {...register('project_type', { required: 'Le type de projet est requis' })} />
              {errors.project_type && (
                <p className="mt-2 text-sm text-red-600">{errors.project_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Objectif du projet
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {OBJECTIVE_OPTIONS.map(opt => {
                  const active = projectObjective === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setValue('objective', opt.value, { shouldDirty: true, shouldValidate: true })
                      }
                      className={`relative flex cursor-pointer rounded-lg border bg-white p-4 text-left shadow-sm transition
                        ${active ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50'
                                 : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className="font-medium text-gray-900">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register('objective', { required: "L'objectif est requis" })} />
              {errors.objective && (
                <p className="mt-2 text-sm text-red-600">{errors.objective.message}</p>
              )}
            </div>
          </div>
        );

      case 'activities':
        return (
          <Controller
            name="activities"
            control={control}
            render={({ field }) => (
              <ActivitySelector
                selectedActivities={field.value || []}
                selectedIntellectualServices={watch('intellectual_services') || []}
                selectedAdditionalServices={watch('additional_services') || []}
                onActivityChange={(id, type) => {
                  if (type === 'activities') {
                    const current = field.value || [];
                    const updated = current.includes(id)
                      ? current.filter(x => x !== id)
                      : [...current, id];
                    field.onChange(updated);
                  } else if (type === 'intellectual') {
                    const current = watch('intellectual_services') || [];
                    const updated = current.includes(id)
                      ? current.filter(x => x !== id)
                      : [...current, id];
                    setValue('intellectual_services', updated);
                  } else {
                    const current = watch('additional_services') || [];
                    const updated = current.includes(id)
                      ? current.filter(x => x !== id)
                      : [...current, id];
                    setValue('additional_services', updated);
                  }
                }}
              />
            )}
          />
        );

      case 'budget':
        // Étape 6 : addition numérique + formatage
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="text-base font-medium text-gray-900 mb-4">Budget estimé</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Budget matériaux (€)"
                  type="number"
                  inputMode="decimal"
                  {...register('budget.materials', {
                    valueAsNumber: true,
                    required: 'Le budget matériaux est requis',
                    min: { value: 0, message: 'Le budget ne peut pas être négatif' },
                  })}
                  error={errors.budget?.materials?.message}
                  placeholder="0"
                />

                <Input
                  label="Budget main d'œuvre (€)"
                  type="number"
                  inputMode="decimal"
                  {...register('budget.labor', {
                    valueAsNumber: true,
                    required: "Le budget main d'œuvre est requis",
                    min: { value: 0, message: 'Le budget ne peut pas être négatif' },
                  })}
                  error={errors.budget?.labor?.message}
                  placeholder="0"
                />
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Budget total estimé</span>
                  <span className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date de début souhaitée"
                type="date"
                {...register('timeline.startDate', { required: 'La date de début est requise' })}
                error={errors.timeline?.startDate?.message}
              />

              <Input
                label="Date de fin souhaitée"
                type="date"
                {...register('timeline.endDate', { required: 'La date de fin est requise' })}
                error={errors.timeline?.endDate?.message}
              />
            </div>
          </div>
        );

      case 'photos':
        return (
          <PhotoManager
            photos={photos}
            onAddPhoto={handlePhotoAdd}
            onDeletePhoto={id => {
              const updatedPhotos = photos.filter(p => p.id !== id);
              setPhotos(updatedPhotos);
              setValue('photos', updatedPhotos);
            }}
            onUpdatePhoto={(id, updates) => {
              const updatedPhotos = photos.map(p => (p.id === id ? { ...p, ...updates } : p));
              setPhotos(updatedPhotos);
              setValue('photos', updatedPhotos);
            }}
          />
        );

      case 'companies':
        return (
          <Controller
            name="selectedCompanies"
            control={control}
            render={({ field }) => (
              <CompanySelector
                project={watch()}
                onCompaniesSelected={companies => {
                  field.onChange(companies.map(c => c.id));
                }}
              />
            )}
          />
        );

      case 'consent':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Mandat de recherche</h4>
              <div className="prose prose-sm text-gray-500">
                <p>En signant ce mandat, vous autorisez TEMI-Construction à :</p>
                <ul>
                  <li>Rechercher des entreprises qualifiées pour votre projet</li>
                  <li>Transmettre vos coordonnées aux entreprises sélectionnées</li>
                  <li>Collecter et traiter vos données personnelles conformément au RGPD</li>
                </ul>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('gdpr_consent', { required: 'Vous devez accepter les conditions' })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    J'accepte les conditions du mandat et la politique de confidentialité
                  </span>
                </label>
                {errors.gdpr_consent && (
                  <p className="mt-2 text-sm text-red-600">{errors.gdpr_consent.message}</p>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                <Controller
                  name="signature"
                  control={control}
                  rules={{ required: 'La signature est requise' }}
                  render={({ field }) => (
                    <SignaturePad onChange={field.onChange} error={errors.signature?.message} />
                  )}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{steps[currentStep].title}</h2>
          <p className="text-sm text-gray-500">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>
        <div className="relative">
          <div className="overflow-hidden h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">{renderStepContent()}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handlePrev}
            leftIcon={currentStep > 0 ? <ChevronLeft size={16} /> : undefined}
          >
            {currentStep === 0 ? 'Annuler' : 'Précédent'}
          </Button>

          <Button
            type={currentStep === steps.length - 1 ? 'submit' : 'button'}
            variant="primary"
            onClick={currentStep === steps.length - 1 ? undefined : handleNext}
            rightIcon={currentStep < steps.length - 1 ? <ChevronRight size={16} /> : undefined}
          >
            {currentStep === steps.length - 1 ? 'Créer le projet' : 'Suivant'}
          </Button>
        </div>
      </form>
    </div>
  );
};
