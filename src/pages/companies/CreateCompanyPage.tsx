import React from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CompanyForm } from '../../components/companies/CompanyForm';
import { useCompanyStore } from '../../store/companyStore';
import { useAuthStore } from '../../store/authStore';
const CreateCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const { createCompany } = useCompanyStore();
  const { user } = useAuthStore();

  const handleSubmit = async (data: any) => {
    try {
      await createCompany(data);
      navigate('/companies');
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux entreprises
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {user?.role === 'mandatary'
            ? 'Proposer une entreprise partenaire'
            : 'Nouvelle entreprise'}
        </h1>

        <CompanyForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/companies')}
          currentUserRole={user?.role}
        />
      </div>
    </div>
  );
};

export default CreateCompanyPage;
