import React, { useState } from "react";

import { Plus, Filter, Search, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  projectCount: number;
  lastActivity: string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  id,
  name,
  email,
  phone,
  address,
  projectCount,
  lastActivity,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/clients/${id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" />
              {email}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Phone size={16} className="mr-2 text-gray-400" />
              {phone}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin size={16} className="mr-2 text-gray-400" />
              {address}
            </p>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
          {projectCount} projets
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Dernière activité: {lastActivity}</span>
        </div>
      </div>
    </div>
  );
};

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isMandatary = user?.role === 'mandatary';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock data - in a real app, this would come from an API
  const clients: ClientCardProps[] = [
    {
      id: '1',
      name: 'Martin Dupont',
      email: 'martin.dupont@example.com',
      phone: '06 12 34 56 78',
      address: '15 Rue de Paris, 75001 Paris',
      projectCount: 3,
      lastActivity: "Aujourd'hui, 10:30",
    },
    {
      id: '2',
      name: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      phone: '06 23 45 67 89',
      address: '8 Avenue Victor Hugo, 69002 Lyon',
      projectCount: 1,
      lastActivity: 'Hier, 14:15',
    },
    {
      id: '3',
      name: 'Jean Petit',
      email: 'jean.petit@example.com',
      phone: '06 34 56 78 90',
      address: '25 Boulevard de la Liberté, 59800 Lille',
      projectCount: 2,
      lastActivity: 'Il y a 3 jours',
    },
    {
      id: '4',
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      phone: '06 45 67 89 01',
      address: '12 Rue Alsace-Lorraine, 31000 Toulouse',
      projectCount: 1,
      lastActivity: 'Il y a 1 semaine',
    },
    {
      id: '5',
      name: 'Pierre Lefebvre',
      email: 'pierre.lefebvre@example.com',
      phone: '06 56 78 90 12',
      address: '5 Rue de la République, 13001 Marseille',
      projectCount: 2,
      lastActivity: 'Il y a 2 semaines',
    },
    {
      id: '6',
      name: 'Isabelle Moreau',
      email: 'isabelle.moreau@example.com',
      phone: '06 67 89 01 23',
      address: '18 Rue du Commerce, 44000 Nantes',
      projectCount: 1,
      lastActivity: 'Il y a 1 mois',
    },
  ];

  const filteredClients = clients.filter(
    client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            onClick={() => navigate('/clients/create')}
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
            placeholder={isMandatary ? 'Rechercher mes clients...' : 'Rechercher clients...'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de projets
                </label>
                <div className="space-y-2">
                  {['Tous', '1', '2', '3+'].map(count => (
                    <div key={count} className="flex items-center">
                      <input
                        id={`count-${count}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`count-${count}`} className="ml-2 text-sm text-gray-700">
                        {count}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dernière activité
                </label>
                <div className="space-y-2">
                  {["Aujourd'hui", 'Cette semaine', 'Ce mois', 'Plus ancien'].map(activity => (
                    <div key={activity} className="flex items-center">
                      <input
                        id={`activity-${activity}`}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`activity-${activity}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {activity}
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
          <ClientCard key={client.id} {...client} />
        ))}
      </div>
    </div>
  );
};

export default ClientsPage;
