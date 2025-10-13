import { FC } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import SafeLink from '../components/common/SafeLink';

export const NotFound: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Home className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page introuvable</h1>

          <p className="text-gray-600 mb-8">
            Le lien que vous avez suivi est invalide ou la page a été déplacée.
          </p>

          <div className="space-y-3">
            <SafeLink route="dashboard">
              <Button variant="primary" fullWidth>
                Retour au tableau de bord
              </Button>
            </SafeLink>

            <Button
              variant="outline"
              fullWidth
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => window.history.back()}
            >
              Page précédente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
