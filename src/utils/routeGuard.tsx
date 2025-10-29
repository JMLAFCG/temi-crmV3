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
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
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
