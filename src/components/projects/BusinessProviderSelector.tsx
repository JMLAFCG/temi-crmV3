import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BusinessProviderSelectorProps {
  value?: string;
  onChange: (providerId: string | null) => void;
  error?: string;
}

export const BusinessProviderSelector: React.FC<BusinessProviderSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // Récupérer les apporteurs d'affaires
      const { data: providers, error: providersError } = await supabase
        .from('business_providers')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (providersError) throw providersError;

      // Récupérer les entreprises partenaires qui peuvent être apporteurs
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .eq('company_category', 'construction_partner')
        .order('name', { ascending: true });

      if (companiesError) throw companiesError;

      // Combiner les deux listes
      const allProviders = [
        ...(providers || []),
        ...(companies || []).map(company => ({
          id: company.id,
          name: company.name,
          email: company.email,
          type: 'partner_company',
          commission_rate: 10, // Taux par défaut pour les entreprises partenaires
          status: 'active',
        })),
      ];

      setProviders(allProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(
    provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Apporteur d'affaires (facultatif)
        </label>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Rechercher un apporteur..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
        <label
          className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
            !value ? 'bg-primary-50' : ''
          }`}
        >
          <input
            type="radio"
            name="provider"
            checked={!value}
            onChange={() => onChange(null)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Aucun apporteur</p>
          </div>
        </label>

        {filteredProviders.map(provider => (
          <label
            key={provider.id}
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
              value === provider.id ? 'bg-primary-50' : ''
            }`}
          >
            <input
              type="radio"
              name="provider"
              value={provider.id}
              checked={value === provider.id}
              onChange={() => onChange(provider.id)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {provider.name}
                {provider.type === 'partner_company' && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Entreprise partenaire
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{provider.email}</p>
              <p className="text-xs text-gray-500">
                Commission : {provider.commission_rate}%
                {provider.type === 'partner_company' && ' (Entreprise partenaire)'}
              </p>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
