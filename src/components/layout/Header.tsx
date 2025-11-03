import React, { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Menu, Search, X, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../ui/Logo';
import { NotificationCenter } from '../ui/NotificationCenter';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-secondary-700 h-16 flex items-center px-4 shadow-lg">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-2xl text-white hover:bg-white/20 lg:hidden transition-colors"
      >
        <Menu size={24} />
      </button>
      <div className="flex-1 flex items-center justify-between">
        <div className={`${showSearch ? 'flex w-full' : 'hidden md:flex'} max-w-lg relative`}>
          {showSearch && (
            <button onClick={() => setShowSearch(false)} className="p-2 mr-1 text-white md:hidden">
              <X size={20} />
            </button>
          )}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher projets, clients, entreprises..."
              className="block w-full pl-10 pr-3 py-2 border-0 rounded-2xl leading-5 bg-white/90 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white sm:text-sm shadow-md"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-2xl text-white hover:bg-white/20 md:hidden transition-colors"
            >
              <Search size={20} />
            </button>
          )}

          <button className="p-2 rounded-2xl text-white hover:bg-white/20 relative transition-colors">
            <MessageSquare size={20} />
          </button>

          <NotificationCenter />

          <div className="ml-3 flex items-center space-x-3">
            <div className="hidden lg:block text-right">
              <p className="text-white text-xs font-medium leading-tight">
                {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
              </p>
              <p className="text-white/80 text-xs leading-tight">
                {String(user?.role) === 'admin'
                  ? 'Administrateur'
                  : String(user?.role) === 'manager'
                    ? 'Gestionnaire'
                    : String(user?.role) === 'commercial'
                      ? 'Commercial'
                      : String(user?.role) === 'mandatary'
                        ? 'Mandataire'
                        : String(user?.role)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold border-2 border-white/30">
              {(user?.firstName || 'U').charAt(0)}
              {(user?.lastName || 'U').charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
