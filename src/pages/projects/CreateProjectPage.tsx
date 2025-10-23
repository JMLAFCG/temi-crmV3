import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProjectWizardForm } from '../../components/projects/ProjectWizardForm';
import { useProjectStore } from '../../store/projectStore';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createProject } = useProjectStore();

  // On lira quand même le param ici (utile si un jour on veut l'afficher en haut)
  const params = new URLSearchParams(location.search);
  const clientIdFromURL = params.get('client_id') || '';

  const handleSubmit = async (data: any) => {
    try {
      await createProject(data);
      navigate('/projects');
    } catch (error) {
      console.error('Error creating project', error);
      navigate('/projects');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux projets
        </Button>
      </div>

      {/* Le ProjectWizardForm va lire ?client_id=... tout seul (voir fichier ci-dessous) */}
      <ProjectWizardForm onSubmit={handleSubmit} onCancel={() => navigate('/projects')} />
    </div>
  );
};

export default CreateProjectPage;

