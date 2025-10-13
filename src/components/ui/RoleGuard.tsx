import type { ReactNode, FC } from 'react';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../utils/permissions';

interface RoleGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: ReactNode;
  allowedRoles?: string[];
}

export const RoleGuard: FC<RoleGuardProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = null,
  allowedRoles = [],
}) => {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  // Vérification du rôle spécifique
  if (requiredRole && user.role !== requiredRole) {
    return <>{fallback}</>;
  }

  // Vérification des rôles autorisés
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Vérification de la permission
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
