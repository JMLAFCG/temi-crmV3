import React from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProjectWizardForm } from '../../components/projects/ProjectWizardForm';
import { useProjectStore } from '../../store/projectStore';
const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();

  const handleSubmit = async (data: any) => {
    try {
      await createProject(data);
      navigate('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux projets
        </button>
      </div>

      <ProjectWizardForm onSubmit={handleSubmit} onCancel={() => navigate('/projects')} />
    </div>
  );
};

export default CreateProjectPage;
