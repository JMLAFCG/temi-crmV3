import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProjectWizardForm } from '../../components/projects/ProjectWizardForm';
import { supabase } from '../../lib/supabase';
import { paths } from '../../routes/paths';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const clientIdFromQuery = params.get('client_id') || '';
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (form: any) => {
    try {
      setError(null);

      const payload = {
        title: form.title || 'Sans titre',
        description: form.description || null,
        client_id: form.client_id || clientIdFromQuery || null,
        agent_id: form.agent_id || null,
        business_provider_id: form.business_provider_id || null,
        status: 'draft',
        location: form.location ?? {},
        surface: form.surface ?? {},
        budget: form.budget ?? {},
        timeline: form.timeline ?? {},
        activities: Array.isArray(form.activities) ? form.activities : [],
        intellectual_services: Array.isArray(form.intellectual_services) ? form.intellectual_services : [],
        additional_services: Array.isArray(form.additional_services) ? form.additional_services : [],
        photos: Array.isArray(form.photos) ? form.photos : [],
        is_demo: false,
      };

      console.log('Creating project with payload:', payload);

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) {
        console.error('Supabase error:', insertError);
        throw insertError;
      }

      console.log('Project created successfully:', data);

      const newId = data?.id;
      if (newId) {
        navigate(`/projects/${newId}`);
      } else {
        navigate(paths.projects);
      }
    } catch (e: any) {
      console.error('Error creating project:', e);
      setError(e?.message || 'Erreur lors de la création du projet');
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

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-medium text-red-800 mb-1">Erreur lors de la création</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau projet</h1>
        <ProjectWizardForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(paths.projects)}
          defaultClientId={clientIdFromQuery}
        />
      </div>
    </div>
  );
};

export default CreateProjectPage;
