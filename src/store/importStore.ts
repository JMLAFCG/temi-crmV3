import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface StagingImport {
  id: string;
  uploaded_by: string;
  file_name: string;
  file_url?: string;
  entity_type: 'company' | 'prospect';
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  status: 'pending' | 'validating' | 'approved' | 'rejected';
  validation_errors: any[];
  validated_by?: string;
  validated_at?: string;
  rejection_reason?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ImportStore {
  imports: StagingImport[];
  loading: boolean;
  error: string | null;
  fetchImports: () => Promise<void>;
  createImport: (data: Partial<StagingImport>) => Promise<StagingImport | null>;
  approveImport: (importId: string) => Promise<boolean>;
  rejectImport: (importId: string, reason: string) => Promise<boolean>;
  deleteImport: (importId: string) => Promise<boolean>;
}

export const useImportStore = create<ImportStore>((set, get) => ({
  imports: [],
  loading: false,
  error: null,

  fetchImports: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('staging_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ imports: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createImport: async (importData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('staging_imports')
        .insert([
          {
            ...importData,
            uploaded_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        imports: [data, ...state.imports],
        loading: false,
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  approveImport: async (importId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('staging_imports')
        .update({
          status: 'approved',
          validated_by: user.id,
          validated_at: new Date().toISOString(),
        })
        .eq('id', importId);

      if (error) throw error;

      await get().fetchImports();
      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  rejectImport: async (importId: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('staging_imports')
        .update({
          status: 'rejected',
          validated_by: user.id,
          validated_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', importId);

      if (error) throw error;

      await get().fetchImports();
      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  deleteImport: async (importId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('staging_imports')
        .delete()
        .eq('id', importId);

      if (error) throw error;

      set(state => ({
        imports: state.imports.filter(i => i.id !== importId),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));
