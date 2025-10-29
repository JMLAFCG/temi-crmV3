import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface BusinessProvider {
  id: string;
  user_id: string;
  type: 'individual' | 'company';
  first_name: string;
  last_name: string;
  company_name?: string;
  siret?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  commission_rate: number;
  total_commissions: number;
  pending_commissions: number;
  projects_count: number;
  documents: {
    identity: unknown;
    kbis?: unknown;
    partnership_agreement: unknown;
  };
  banking: {
    iban: string;
    bic: string;
    account_holder: string;
  };
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProviderState {
  providers: BusinessProvider[];
  loading: boolean;
  error: string | null;
  fetchProviders: () => Promise<void>;
  createProvider: (data: Partial<BusinessProvider>) => Promise<BusinessProvider>;
  updateProvider: (id: string, updates: Partial<BusinessProvider>) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  calculateCommissions: (providerId: string) => Promise<void>;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  providers: [],
  loading: false,
  error: null,

  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('business_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ providers: data as BusinessProvider[], error: null });
    } catch (error) {
      console.error('Erreur lors de la récupération des apporteurs:', error);
      set({ error: 'Erreur lors de la récupération des apporteurs' });
    } finally {
      set({ loading: false });
    }
  },

  createProvider: async providerData => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('business_providers')
        .insert({
          ...providerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const providers = get().providers;
      set({ providers: [data as BusinessProvider, ...providers], error: null });
      return data as BusinessProvider;
    } catch (error) {
      console.error("Erreur lors de la création de l'apporteur:", error);
      set({ error: "Erreur lors de la création de l'apporteur" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProvider: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('business_providers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const providers = get().providers.map(p => (p.id === id ? { ...p, ...updates } : p));
      set({ providers, error: null });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'apporteur:", error);
      set({ error: "Erreur lors de la mise à jour de l'apporteur" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProvider: async id => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('business_providers').delete().eq('id', id);

      if (error) throw error;

      const providers = get().providers.filter(p => p.id !== id);
      set({ providers, error: null });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'apporteur:", error);
      set({ error: "Erreur lors de la suppression de l'apporteur" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateCommissions: async providerId => {
    set({ loading: true, error: null });
    try {
      // Logique de calcul des commissions
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('budget')
        .eq('provider_id', providerId);

      if (projectsError) throw projectsError;

      const provider = get().providers.find(p => p.id === providerId);
      if (!provider) throw new Error('Apporteur non trouvé');

      const totalCommissions = projects.reduce((sum, project) => {
        return sum + project.budget.total * (provider.commission_rate / 100);
      }, 0);

      await get().updateProvider(providerId, {
        total_commissions: totalCommissions,
      });
    } catch (error) {
      console.error('Erreur lors du calcul des commissions:', error);
      set({ error: 'Erreur lors du calcul des commissions' });
    } finally {
      set({ loading: false });
    }
  },
}));
