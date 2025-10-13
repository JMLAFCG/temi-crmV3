import type { ReactNode, FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AccessDenied } from '../components/ui/AccessDenied';

interface GuardProps {
  children: ReactNode;
  roles?: string[];
  requiredPermission?: string;
  fallback?: ReactNode;
}

export const Guard: FC<GuardProps> = ({ children, roles = [], requiredPermission, fallback }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || <Navigate to="/login" replace />;
  }

  // Vérification des rôles
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      fallback || (
        <AccessDenied
          message="Vous n'avez pas les permissions nécessaires pour accéder à cette page."
          requiredRole={roles.join(' ou ')}
        />
      )
    );
  }

  // Vérification des permissions (si implémenté)
  if (requiredPermission) {
    // Logique de vérification des permissions à implémenter
    // Pour l'instant, on laisse passer
  }

  return <>{children}</>;
};

export default Guard;
