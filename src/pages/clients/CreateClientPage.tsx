import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ClientForm } from '../../components/clients/ClientForm';
import { useClientStore } from '../../store/clientStore';
import { paths } from '../../routes/paths';

const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createClient } = useClientStore();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // On attend l'insert pour récupérer l'id du client
      const inserted = await createClient(data);

      // On tente proprement plusieurs formes possibles de retour
      const newClientId =
        inserted?.id ??
        inserted?.[0]?.id ??
        inserted?.data?.[0]?.id ??
        inserted?.data?.id;

      if (newClientId) {
        // Enchaînement : aller sur "Créer projet" avec le client pré-sélectionné
        navigate(
          `${paths.projectsCreate}?client_id=${encodeURIComponent(newClientId)}`
        );
      } else {
        console.warn(
          '[CreateClientPage] id client non détecté dans la réponse, retour à la liste.',
          inserted
        );
        navigate(paths.clients);
      }
    } catch (error) {
      console.error('Error creating client', error);
      navigate(paths.clients);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(paths.clients)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux clients
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau client</h1>

        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(paths.clients)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreateClientPage;


