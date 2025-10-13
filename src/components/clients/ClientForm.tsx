import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LocationSelector } from '../projects/LocationSelector';

interface ClientFormData {
  type: 'individual' | 'couple' | 'company';
  user_first_name: string;
  user_last_name: string;
  spouse_first_name?: string;
  spouse_last_name?: string;
  company_name?: string;
  siret?: string;
  user_email: string;
  phone?: string;
  address: {
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  notes?: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ClientFormData>;
  isLoading?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClientFormData>({
    defaultValues: {
      type: initialData?.type || 'individual',
      user_first_name: initialData?.user_first_name || '',
      user_last_name: initialData?.user_last_name || '',
      spouse_first_name: initialData?.spouse_first_name || '',
      spouse_last_name: initialData?.spouse_last_name || '',
      user_email: initialData?.user_email || '',
      phone: initialData?.phone || '',
      company_name: initialData?.company_name || '',
      siret: initialData?.siret || '',
      address: initialData?.address || {},
      notes: initialData?.notes || '',
    },
  });

  const clientType = watch('type');

  const handleFormSubmit = async (data: ClientFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Debug info */}
      <div className="bg-construction-teal/10 p-3 rounded-lg text-sm text-construction-teal border border-construction-teal/20">
        <p>
          <strong>Mode développement :</strong> Les clients sont créés localement pour la
          démonstration.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type de client</label>
        <div className="grid grid-cols-3 gap-4">
          <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
            <input type="radio" {...register('type')} value="individual" className="sr-only" />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">Particulier</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  Client individuel
                </span>
              </span>
            </span>
            <span
              className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                clientType === 'individual' ? 'border-primary-500' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>

          <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
            <input type="radio" {...register('type')} value="couple" className="sr-only" />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">Couple</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">Deux personnes</span>
              </span>
            </span>
            <span
              className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                clientType === 'couple' ? 'border-primary-500' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>

          <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
            <input type="radio" {...register('type')} value="company" className="sr-only" />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">Entreprise</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  Client professionnel
                </span>
              </span>
            </span>
            <span
              className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                clientType === 'company' ? 'border-primary-500' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientType !== 'company' && (
          <>
            <Input
              label="Prénom"
              {...register('user_first_name', { required: 'Le prénom est requis' })}
              error={errors.user_first_name?.message}
            />

            <Input
              label="Nom"
              {...register('user_last_name', { required: 'Le nom est requis' })}
              error={errors.user_last_name?.message}
            />
          </>
        )}

        {clientType === 'couple' && (
          <>
            <Input
              label="Prénom du conjoint"
              {...register('spouse_first_name', { required: 'Le prénom du conjoint est requis' })}
              error={errors.spouse_first_name?.message}
            />

            <Input
              label="Nom du conjoint"
              {...register('spouse_last_name', { required: 'Le nom du conjoint est requis' })}
              error={errors.spouse_last_name?.message}
            />
          </>
        )}

        {clientType === 'company' && (
          <>
            <Input
              label="Nom de l'entreprise"
              {...register('company_name', { required: "Le nom de l'entreprise est requis" })}
              error={errors.company_name?.message}
            />

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
          </>
        )}

        <Input
          label="Email"
          type="email"
          {...register('user_email', {
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide',
            },
          })}
          error={errors.user_email?.message}
        />

        <Input label="Téléphone" {...register('phone')} error={errors.phone?.message} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Adresse</h3>
        <LocationSelector
          value={watch('address')}
          onChange={location => setValue('address', location)}
          errors={errors.address as any}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
        >
          {initialData ? 'Mettre à jour' : 'Créer le client'}
        </Button>
      </div>
    </form>
  );
};
