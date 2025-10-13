import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Company {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  activities: string[];
  status: 'active' | 'inactive';
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CompanyState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  createCompany: (data: Partial<Company>) => Promise<Company>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  loading: false,
  error: null,

  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ companies: data as Company[], error: null });
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      set({ error: 'Erreur lors de la récupération des entreprises' });
    } finally {
      set({ loading: false });
    }
  },

  createCompany: async companyData => {
    set({ loading: true, error: null });
    try {
      // Si créé par un mandataire, forcer le statut en attente
      const finalData = {
        ...companyData,
        verification_status:
          companyData.created_by_role === 'mandatary'
            ? 'pending'
            : companyData.verification_status || 'pending',
        status: companyData.created_by_role === 'mandatary' ? 'inactive' : 'active', // Inactif jusqu'à validation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('companies').insert(finalData).select().single();

      if (error) throw error;

      const companies = get().companies;
      set({ companies: [data as Company, ...companies], error: null });
      return data as Company;
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error);
      set({ error: "Erreur lors de la création de l'entreprise" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCompany: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const companies = get().companies.map(c => (c.id === id ? { ...c, ...updates } : c));
      set({ companies, error: null });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'entreprise:", error);
      set({ error: "Erreur lors de la mise à jour de l'entreprise" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteCompany: async id => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);

      if (error) throw error;

      const companies = get().companies.filter(c => c.id !== id);
      set({ companies, error: null });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error);
      set({ error: "Erreur lors de la suppression de l'entreprise" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
