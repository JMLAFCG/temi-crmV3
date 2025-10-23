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
      // ⚠️ on attend l'insert pour récupérer l'id du client
      const inserted = await createClient(data);

      // on tente proprement plusieurs formes possibles de retour
      const newClientId =
        inserted?.id ??
        inserted?.[0]?.id ??
        inserted?.data?.[0]?.id ??
        inserted?.data?.id;

      if (newClientId) {
        // ✅ enchaînement : on va directement sur "Créer projet" avec le client pré-sélectionné
        navigate(`/projects/create?client_id=${newClientId}`);
      } else {
        console.warn(
          '[CreateClientPage] id client non détecté dans la réponse, retour à la liste.',
          inserted
        );
        navigate('/clients');
      }
    } catch (error) {
      console.error('Error creating client', error);
      // en cas d’erreur on retourne sur la liste (comportement actuel)
      navigate('/clients');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/clients')}
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
          onCancel={() => navigate('/clients')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreateClientPage;

