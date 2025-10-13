import React from "react";
import { NavLink, Outlet } from 'react-router-dom';
import { Settings, Users, Shield, CreditCard, Globe } from 'lucide-react';

const navigation = [
  { name: 'Général', href: '/settings/general', icon: Settings },
  { name: 'Utilisateurs', href: '/settings/users', icon: Users },
  { name: 'Rôles', href: '/settings/roles', icon: Shield },
  { name: 'Facturation', href: '/settings/billing', icon: CreditCard },
  { name: 'Intégrations', href: '/settings/integrations', icon: Globe },
];
const SettingsLayout: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-2">
          <nav className="space-y-1">
            {navigation.map(item => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
