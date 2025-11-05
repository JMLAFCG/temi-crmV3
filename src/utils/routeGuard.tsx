// src/utils/routeGuard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { paths } from '../routes/paths';
import { useAuthStore } from '../store/authStore';

type GuardProps = {
  children: React.ReactNode;
  roles?: string[];
};

const Guard: React.FC<GuardProps> = ({ children, roles }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  if (!roles || roles.length === 0) {
    return <>{children}</>;
  }

  const userRoles: string[] = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  const hasRight = roles.some((r) => userRoles.includes(r)) || userRoles.includes('admin');

  if (!hasRight) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <>{children}</>;
};

export default Guard;
