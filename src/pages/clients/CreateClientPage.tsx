import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ClientForm } from '../../components/clients/ClientForm';
import { useClientStore } from '../../store/clientStore';
const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createClient } = useClientStore();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Creating client from page:', data);
      await createClient(data);
      console.log('Client created successfully, navigating to clients page');
      navigate('/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      // Naviguer quand même vers la page clients
      console.warn('Error during creation but continuing navigation');
      navigate('/clients');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux clients
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau client</h1>

        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/clients')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreateClientPage;
