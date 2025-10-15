import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getNavConfigForRole } from '../../ui/navConfig';
import { Logo } from '../ui/Logo';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import SafeLink from '../common/SafeLink';
import { paths } from '../../routes/paths';

// ✅ On réutilise TON hook existant (export nommé)
import { useNotifications } from '../../hooks/useNotifications';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Compteur de notifications non lues depuis ton hook
  const { unreadCount } = useNotifications();

  const userRole = (user?.role as string) || 'client';
  const navigationItems = useMemo(() => getNavConfigForRole(userRole), [userRole]);

  const isActive = useMemo(
    () => (route: string) => {
      const routePath = paths[route as keyof typeof paths];
      if (!routePath) return false;
      return location.pathname === routePath || location.pathname.startsWith(routePath + '/');
    },
    [location.pathname]
  );

  // Détermine si un item correspond bien à la route "notifications"
  const isNotificationsRoute = (routeKey: string) => {
    const routePath = paths[routeKey as keyof typeof paths];
    return routeKey === 'notifications' || routePath === paths.notifications;
  };

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* En-tête */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Logo size="lg" variant="full" />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            aria-label="Fermer la barre latérale"
          >
            ×
          </button>
        )}
      </div>

      {/* Utilisateur */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {(user?.firstName || 'Utilisateur').charAt(0)}
              {(user?.lastName || '').charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole === 'admin'
                ? 'Administrateur'
                : userRole === 'manager'
                ? 'Gestionnaire'
                : userRole === 'commercial'
                ? 'Commercial'
                : userRole === 'mandatary'
                ? 'Mandataire'
                : userRole === 'client'
                ? 'Client'
                : userRole === 'partner_company'
                ? 'Entreprise'
                : userRole === 'business_provider'
                ? 'Apporteur'
                : userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const routeKey = String(item.route);
          const active = isActive(routeKey);
          const showNotifBadge = isNotificationsRoute(routeKey) && unreadCount > 0;

          return (
            <div key={routeKey}>
              <SafeLink
                route={item.route}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={onClose}
              >
                <span
                  className={`mr-3 ${
                    active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  {item.icon}
                </span>

                <span className="flex-1">{item.label}</span>

                {/* Seule pastille affichée : notifications non lues (live). 
                   Tous les autres anciens badges “démo” sont ignorés. */}
                {showNotifBadge && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      active ? 'bg-primary-200 text-primary-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </SafeLink>

              {/* Sous-éléments */}
              {item.subItems && active && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <SafeLink
                      key={String(subItem.route)}
                      route={subItem.route}
                      className="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={onClose}
                    >
                      {subItem.label}
                    </SafeLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" fullWidth leftIcon={<LogOut size={16} />} onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

