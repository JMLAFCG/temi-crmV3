import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User } from '../types';
import { getCurrentUser, signIn, signOut, signUp, mapSupabaseUserToAppUser } from '../lib/supabase';
import { env } from '../config/env';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setMockUser: () => void;
  getViewUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        console.error('Erreur de connexion:', error);

        // Enhanced error message for 500 errors
        let errorMessage = error.message || 'Identifiants invalides';
        if ((error as any).status === 500 || error.message?.includes('500')) {
          errorMessage = 'Erreur d\'authentification (500) — Configuration Supabase invalide. Vérifiez les variables d\'environnement.';
          console.error('❌ ERREUR 500 détectée dans authStore.login');
        }

        set({
          error: errorMessage,
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return;
      }

      if (data?.user) {
        try {
          const appUser = await mapSupabaseUserToAppUser(data.user);

          if (!appUser || !appUser.email) {
            throw new Error('Impossible de charger les données utilisateur');
          }

          set({
            user: appUser,
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
        } catch (mappingError: any) {
          console.error('Erreur lors du mapping de l\'utilisateur:', mappingError);
          set({
            error: mappingError.message || 'Erreur lors du chargement des données utilisateur',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
        }
      } else {
        set({
          error: 'Aucun utilisateur retourné',
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
      }
    } catch (err: any) {
      console.error('Erreur inattendue lors de la connexion:', err);
      set({
        error: err.message || "Une erreur inattendue s'est produite",
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        set({ error: error.message, isLoading: false, isAuthenticated: false });
        return;
      }

      if (data.user) {
        const appUser = await mapSupabaseUserToAppUser(data.user);
        set({ user: appUser, isLoading: false, isAuthenticated: true });
      }
    } catch (err) {
      set({ error: "Une erreur inattendue s'est produite", isLoading: false, isAuthenticated: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await signOut();

      if (error) {
        set({ error: error.message, isLoading: false, isAuthenticated: false });
        return;
      }

      localStorage.clear();
      sessionStorage.clear();

      set({ user: null, isLoading: false, isAuthenticated: false });

      window.location.href = '/login';
    } catch (err) {
      set({ error: "Une erreur inattendue s'est produite", isLoading: false, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabaseUser = await getCurrentUser();

      if (supabaseUser) {
        try {
          const appUser = await mapSupabaseUserToAppUser(supabaseUser);

          if (!appUser || !appUser.email) {
            console.warn('Données utilisateur invalides après mapping');
            set({ user: null, isLoading: false, isAuthenticated: false, error: null });
            return;
          }

          set({ user: appUser, isLoading: false, isAuthenticated: true, error: null });
        } catch (mappingError) {
          console.error('Erreur lors du mapping de l\'utilisateur (checkAuth):', mappingError);
          set({ user: null, isLoading: false, isAuthenticated: false, error: null });
        }
      } else {
        set({ user: null, isLoading: false, isAuthenticated: false, error: null });
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de l'authentification:", err);
      set({ user: null, isLoading: false, isAuthenticated: false, error: null });
    }
  },

  setMockUser: () => {
    const mockUser: User = {
      id: 'admin-user-id',
      email: 'jml@afcg-courtage.com',
      firstName: 'Jean-Marc',
      lastName: 'Leton',
      role: 'admin',
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2025-04-10T14:22:00Z',
    };
    set({ user: mockUser, isLoading: false, isAuthenticated: true, error: null });
  },

  getViewUser: () => {
    return (window as any).__tempViewUser || null;
  },
}))
);
