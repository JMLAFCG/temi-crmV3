import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProjectWizardForm } from '../../components/projects/ProjectWizardForm';
import { useProjectStore } from '../../store/projectStore';
import { paths } from '../../routes/paths';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { createProject } = useProjectStore();

  // client_id passé par l’étape “Créer client”
  const presetClientId = params.get('client_id') ?? '';

  const handleSubmit = async (data: any) => {
    try {
      // sécurités douces : garantit des nombres
      const materials = Number(data?.budget?.materials ?? 0);
      const labor     = Number(data?.budget?.labor ?? 0);
      const services  = Number(data?.budget?.services ?? 0);

      const payload = {
        ...data,
        // si le client a été pré-sélectionné, on le garde
        client_id: data?.client_id || presetClientId || null,
        budget: {
          ...data?.budget,
          materials,
          labor,
          services,
          // total a déjà été calculé côté formulaire, mais on recalcule au cas où
          total: materials + labor + services,
        },
      };

      await createProject(payload);
      navigate(paths.projects); // retour liste projets
    } catch (err) {
      console.error('Erreur création projet:', err);
      // on reste sur la page pour que l’utilisateur corrige
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(paths.projects)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux projets
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau projet</h1>

        {/* On injecte le client pré-sélectionné via defaultValues du form */}
        <ProjectWizardForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(paths.projects)}
          // le composant gère ses defaults, mais on force l’amorçage client ici :
          // petite astuce : on passe via key pour réinitialiser proprement si query change
          key={presetClientId || 'no-client'}
        />
      </div>
    </div>
  );
};

export default CreateProjectPage;


