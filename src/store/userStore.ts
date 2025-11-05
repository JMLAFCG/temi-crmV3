import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  password?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<User>;
  updateUser: (id: string, updates: Partial<UserFormData>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserStatus: (id: string, status: 'active' | 'inactive') => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ users: data as User[], error: null });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      set({ error: 'Erreur lors de la récupération des utilisateurs' });
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const users = get().users;
      set({ users: [data as User, ...users], error: null });
      return data as User;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      set({ error: 'Erreur lors de la création de l\'utilisateur' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const users = get().users.map(u => (u.id === id ? { ...u, ...updates } : u));
      set({ users, error: null });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      set({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateUserStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('users')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const users = get().users.map(u => (u.id === id ? { ...u, status } : u));
      set({ users, error: null });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      set({ error: 'Erreur lors de la mise à jour du statut' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);

      if (error) throw error;

      const users = get().users.filter(u => u.id !== id);
      set({ users, error: null });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      set({ error: 'Erreur lors de la suppression de l\'utilisateur' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
