import { create } from 'zustand';
import { Project } from '../types';
import { supabase } from '../lib/supabase';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getContractorQuotes: () => Promise<any[]>;
  getQuoteOpportunities: () => Promise<any[]>;
  submitQuote: (projectId: string, quoteData: any) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          client:client_id(*),
          agent:agent_id(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ projects: data as Project[], error: null });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: 'Erreur lors de la récupération des projets' });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async project => {
    set({ loading: true, error: null });
    try {
      // Calculer automatiquement les commissions si un apporteur est spécifié
      let projectData = { ...project };
      if (project.business_provider_id && project.budget?.total) {
        const baseCommissionRate = 0.12; // 12% de commission de base
        const providerCommissionRate = 0.1; // 10% pour l'apporteur

        const commissionAmount = project.budget.total * baseCommissionRate;
        const providerCommission = commissionAmount * providerCommissionRate;

        projectData = {
          ...project,
          commission_amount: commissionAmount,
          commission_rate: baseCommissionRate * 100,
          provider_commission: providerCommission,
          provider_commission_rate: providerCommissionRate * 100,
        };

        // Mettre à jour les statistiques de l'apporteur
        try {
          const { error: updateError } = await supabase
            .from('business_providers')
            .update({
              pending_commissions: supabase.raw(`pending_commissions + ${providerCommission}`),
              projects_count: supabase.raw('projects_count + 1'),
            })
            .eq('id', project.business_provider_id);

          if (updateError) {
            console.warn('Could not update provider stats:', updateError);
          }
        } catch (error) {
          console.warn('Error updating provider stats:', error);
        }
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const projects = get().projects;
      set({ projects: [data as Project, ...projects], error: null });
      return data as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      set({ error: 'Erreur lors de la création du projet' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const projects = get().projects.map(p => (p.id === id ? { ...p, ...updates } : p));
      set({ projects, error: null });
    } catch (error) {
      console.error('Error updating project:', error);
      set({ error: 'Erreur lors de la mise à jour du projet' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async id => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      const projects = get().projects.filter(p => p.id !== id);
      set({ projects, error: null });
    } catch (error) {
      console.error('Error deleting project:', error);
      set({ error: 'Erreur lors de la suppression du projet' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getContractorQuotes: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('quotes')
        .select(
          `
          *,
          project:project_id(*),
          contractor:contractor_id(*)
        `
        )
        .eq('contractor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contractor quotes:', error);
      return [];
    }
  },

  getQuoteOpportunities: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('quote_invitations')
        .select(
          `
          *,
          project:project_id(*),
          contractor:contractor_id(*)
        `
        )
        .eq('contractor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching quote opportunities:', error);
      return [];
    }
  },

  submitQuote: async (projectId, quoteData) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('quotes').insert({
        project_id: projectId,
        contractor_id: user.id,
        ...quoteData,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting quote:', error);
      set({ error: 'Erreur lors de la soumission du devis' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
