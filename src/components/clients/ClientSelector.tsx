import React, { useState, useEffect } from 'react';
import { Search, Plus, X as XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { ClientForm } from './ClientForm';
import { useClientStore } from '../../store/clientStore';

interface ClientSelectorProps {
  value?: string;
  onChange: (clientId: string) => void;
  error?: string;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange, error }) => {
  const { clients, loading, fetchClients, createClient } = useClientStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (data: any) => {
    try {
      console.log('Creating client with data:', data);
      const newClient = await createClient(data);
      console.log('Client created successfully:', newClient);
      onChange(newClient.id);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating client:', error);
      // Ne pas afficher d'erreur pour ne pas interrompre le flux
      console.warn('Client creation had issues but continuing...');
    }
  };

  const filteredClients = clients.filter(
    client =>
      client.user &&
      (`${client.user.first_name} ${client.user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        client.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.company_name &&
          client.company_name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Nouveau client</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon size={24} />
            </button>
          </div>
          <ClientForm
            onSubmit={handleCreateClient}
            onCancel={() => setShowCreateForm(false)}
            isLoading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreateForm(true)}
        >
          Nouveau client
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
        {filteredClients.map(client => (
          <label
            key={client.id}
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
              value === client.id ? 'bg-primary-50' : ''
            }`}
          >
            <input
              type="radio"
              name="client"
              value={client.id}
              checked={value === client.id}
              onChange={() => onChange(client.id)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div className="ml-3">
              {client.user ? (
                <>
                  <p className="text-sm font-medium text-gray-900">
                    {client.user.first_name} {client.user.last_name}
                  </p>
                  {client.company_name && (
                    <p className="text-sm text-gray-600">{client.company_name}</p>
                  )}
                  <p className="text-sm text-gray-500">{client.user.email}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Données utilisateur manquantes</p>
              )}
            </div>
          </label>
        ))}
        {filteredClients.length === 0 && !loading && (
          <div className="p-4 text-center text-gray-500">Aucun client trouvé</div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
