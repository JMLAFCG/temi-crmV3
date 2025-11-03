import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Prospect {
  id: string;
  owner_id: string;
  company_name?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  email?: string;
  phone?: string;
  address?: any;
  industry?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'import' | 'manual' | 'referral';
  notes?: string;
  last_contact_date?: string;
  next_action_date?: string;
  converted_to_client_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ProspectionActivity {
  id: string;
  prospect_id: string;
  user_id: string;
  activity_type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  content?: string;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  metadata?: any;
  created_at: string;
}

interface ProspectStore {
  prospects: Prospect[];
  activities: ProspectionActivity[];
  loading: boolean;
  error: string | null;
  fetchProspects: () => Promise<void>;
  fetchProspectActivities: (prospectId: string) => Promise<void>;
  createProspect: (data: Partial<Prospect>) => Promise<Prospect | null>;
  updateProspect: (id: string, data: Partial<Prospect>) => Promise<boolean>;
  deleteProspect: (id: string) => Promise<boolean>;
  addActivity: (data: Partial<ProspectionActivity>) => Promise<boolean>;
  convertToClient: (prospectId: string) => Promise<string | null>;
}

export const useProspectStore = create<ProspectStore>((set, get) => ({
  prospects: [],
  activities: [],
  loading: false,
  error: null,

  fetchProspects: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ prospects: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProspectActivities: async (prospectId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('prospection_activities')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ activities: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createProspect: async (prospectData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('prospects')
        .insert([
          {
            ...prospectData,
            owner_id: prospectData.owner_id || user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        prospects: [data, ...state.prospects],
        loading: false,
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  updateProspect: async (id: string, prospectData: Partial<Prospect>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('prospects')
        .update(prospectData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        prospects: state.prospects.map(p => (p.id === id ? { ...p, ...prospectData } : p)),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  deleteProspect: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('prospects').delete().eq('id', id);

      if (error) throw error;

      set(state => ({
        prospects: state.prospects.filter(p => p.id !== id),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  addActivity: async (activityData: Partial<ProspectionActivity>) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('prospection_activities')
        .insert([
          {
            ...activityData,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      if (activityData.prospect_id) {
        await get().fetchProspectActivities(activityData.prospect_id);
      }

      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  convertToClient: async (prospectId: string) => {
    set({ loading: true, error: null });
    try {
      const prospect = get().prospects.find(p => p.id === prospectId);
      if (!prospect) throw new Error('Prospect not found');

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            user_id: prospect.owner_id,
            company_name: prospect.company_name,
            phone: prospect.phone,
            address: prospect.address || {},
            notes: prospect.notes,
          },
        ])
        .select()
        .single();

      if (clientError) throw clientError;

      await get().updateProspect(prospectId, {
        status: 'converted',
        converted_to_client_id: clientData.id,
      });

      set({ loading: false });
      return clientData.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
}));
