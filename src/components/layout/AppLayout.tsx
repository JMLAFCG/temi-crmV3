import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/authStore';
import { safeNavigate } from '../../lib/safeNavigate';

export const AppLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      safeNavigate(navigate, 'login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Redirection automatique selon le rôle
  useEffect(() => {
    if (user && !isLoading) {
      const currentPath = window.location.pathname;

      // Rediriger les clients vers leur dashboard spécifique
      if (user.role === 'client' && currentPath === '/dashboard') {
        safeNavigate(navigate, 'dashboardClient');
        return;
      }

      // Rediriger les entreprises vers leur dashboard spécifique
      if (user.role === 'partner_company' && currentPath === '/dashboard') {
        safeNavigate(navigate, 'dashboardEntreprise');
        return;
      }

      // Rediriger les apporteurs vers leur dashboard spécifique
      if (user.role === 'business_provider' && currentPath === '/dashboard') {
        safeNavigate(navigate, 'dashboardApporteur');
        return;
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 flex flex-col z-40 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1 w-full">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
