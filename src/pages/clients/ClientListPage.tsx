import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown, Building, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useClientStore } from '../../store/clientStore';
import { ClientForm } from '../../components/clients/ClientForm';
const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, loading, fetchClients, createClient } = useClientStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (data: any) => {
    try {
      await createClient(data);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchString = searchQuery.toLowerCase();
    return (
      `${client.user.first_name} ${client.user.last_name}`.toLowerCase().includes(searchString) ||
      client.user.email.toLowerCase().includes(searchString) ||
      (client.company_name && client.company_name.toLowerCase().includes(searchString)) ||
      (client.phone && client.phone.toLowerCase().includes(searchString))
    );
  });

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour à la liste
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau client</h1>

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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Gérez vos clients et leurs projets</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateForm(true)}
          >
            Nouveau Client
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher clients..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            rightIcon={<ChevronDown size={16} />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filtrer
          </Button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="space-y-2">
                  {['Particuliers', 'Entreprises'].map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        id={`type-${type}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <div className="space-y-2">
                  {['Actif', 'Inactif'].map(status => (
                    <div key={status} className="flex items-center">
                      <input
                        id={`status-${status}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm">
                  Appliquer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {client.user.first_name} {client.user.last_name}
                </h3>
                {client.company_name && (
                  <p className="text-sm text-gray-600">{client.company_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 flex items-center">
                <Mail size={16} className="mr-2 text-gray-400" />
                {client.user.email}
              </p>
              {client.phone && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  {client.phone}
                </p>
              )}
              {client.address && client.address.city && (
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {client.address.city}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <Button variant="outline" size="sm">
                  Voir détails
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientListPage;
