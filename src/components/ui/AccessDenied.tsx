import type { FC } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { safeNavigate } from '../../lib/safeNavigate';

interface AccessDeniedProps {
  message?: string;
  requiredRole?: string;
  showBackButton?: boolean;
}

export const AccessDenied: FC<AccessDeniedProps> = ({
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  requiredRole,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <Shield className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h2>

        <p className="text-gray-600 mb-6">{message}</p>

        {requiredRole && (
          <p className="text-sm text-gray-500 mb-6">
            Rôle requis : <span className="font-medium">{requiredRole}</span>
          </p>
        )}

        {showBackButton && (
          <div className="space-y-3">
            <Button variant="primary" onClick={() => safeNavigate(navigate, 'dashboard')}>
              Retour au tableau de bord
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft size={16} />}
            >
              Page précédente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
