import React from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BusinessProviderForm } from '../../components/providers/BusinessProviderForm';
import { useProviderStore } from '../../store/providerStore';
const CreateBusinessProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProvider } = useProviderStore();

  const handleSubmit = async (data: any) => {
    try {
      await createProvider(data);
      navigate('/providers');
    } catch (error) {
      console.error("Erreur lors de la création de l'apporteur:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/providers')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux apporteurs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouvel apporteur d'affaires</h1>

        <BusinessProviderForm onSubmit={handleSubmit} onCancel={() => navigate('/providers')} />
      </div>
    </div>
  );
};

export default CreateBusinessProviderPage;
