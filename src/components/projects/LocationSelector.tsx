import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '../ui/Input';

interface LocationSelectorProps {
  value: {
    address: string;
    postalCode: string;
    city: string;
    details?: string;
  };
  onChange: (location: any) => void;
  errors?: {
    address?: string;
    postalCode?: string;
    city?: string;
  };
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value = {
    address: '',
    postalCode: '',
    city: '',
    details: '',
  },
  onChange,
  errors,
}) => {
  const [cities, setCities] = useState<Array<{ name: string; code: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (value.postalCode?.length === 5) {
      fetchCities(value.postalCode);
    } else {
      setCities([]);
    }
  }, [value.postalCode]);

  const fetchCities = async (postalCode: string) => {
    setLoading(true);
    setPostalCodeError(null);
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom,code`
      );
      if (!response.ok) throw new Error('Erreur lors de la recherche des villes');

      const data = await response.json();
      setCities(
        data.map((city: any) => ({
          name: city.nom,
          code: city.code,
        }))
      );

      if (data.length === 1) {
        onChange({
          ...value,
          city: data[0].nom,
        });
      } else if (data.length === 0) {
        setPostalCodeError('Code postal invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche des villes:', error);
      setPostalCodeError('Erreur lors de la recherche des villes');
    } finally {
      setLoading(false);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPostalCode = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    onChange({
      ...value,
      postalCode: newPostalCode,
      city: '', // Reset city when postal code changes
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Adresse"
          value={value.address}
          onChange={e => onChange({ ...value, address: e.target.value })}
          error={errors?.address}
          placeholder="Numéro et nom de rue"
          leftIcon={<MapPin size={18} className="text-gray-400" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Code postal"
              value={value.postalCode}
              onChange={handlePostalCodeChange}
              error={errors?.postalCode || postalCodeError}
              placeholder="75001"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              disabled={loading}
            />
            {loading && <div className="mt-1 text-sm text-gray-500">Recherche des villes...</div>}
          </div>

          {cities.length > 1 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select
                value={value.city}
                onChange={e => onChange({ ...value, city: e.target.value })}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                disabled={loading}
              >
                <option value="">Sélectionner une ville</option>
                {cities.map(city => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors?.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>
          ) : (
            <Input
              label="Ville"
              value={value.city}
              onChange={e => onChange({ ...value, city: e.target.value })}
              error={errors?.city}
              placeholder="Paris"
              disabled={loading}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informations complémentaires
          </label>
          <textarea
            value={value.details || ''}
            onChange={e => onChange({ ...value, details: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Informations d'accès, codes, étage..."
          />
        </div>
      </div>
    </div>
  );
};
