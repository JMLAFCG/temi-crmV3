import type { ReactNode, FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { canAccessRoute } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  allowedRoles = [],
  fallbackPath = '/dashboard',
}) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérification du rôle spécifique
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Vérification des rôles autorisés
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Vérification de la permission
  if (requiredPermission && !canAccessRoute(user.role, window.location.pathname)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
