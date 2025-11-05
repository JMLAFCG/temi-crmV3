import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface RegistrationRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  siret?: string;
  requested_role: 'mandataire' | 'apporteur' | 'partner_company';
  motivation?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequestFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  siret?: string;
  requested_role: 'mandataire' | 'apporteur' | 'partner_company';
  motivation?: string;
}

interface RegistrationRequestState {
  requests: RegistrationRequest[];
  loading: boolean;
  error: string | null;
  pendingCount: number;
  fetchRequests: () => Promise<void>;
  fetchPendingCount: () => Promise<void>;
  createRequest: (data: RegistrationRequestFormData) => Promise<void>;
  approveRequest: (id: string, createAccount: boolean) => Promise<{ userId?: string; success: boolean }>;
  rejectRequest: (id: string, reason: string) => Promise<void>;
}

export const useRegistrationRequestStore = create<RegistrationRequestState>((set, get) => ({
  requests: [],
  loading: false,
  error: null,
  pendingCount: 0,

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data as RegistrationRequest[], error: null });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des demandes:', error);
      set({ error: 'Erreur lors de la récupération des demandes' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPendingCount: async () => {
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      set({ pendingCount: data || 0 });
    } catch (error) {
      console.error('Erreur lors du comptage des demandes en attente:', error);
    }
  },

  createRequest: async (requestData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('registration_requests').insert({
        email: requestData.email,
        first_name: requestData.first_name,
        last_name: requestData.last_name,
        phone: requestData.phone,
        company_name: requestData.company_name,
        siret: requestData.siret,
        requested_role: requestData.requested_role,
        motivation: requestData.motivation,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await get().fetchPendingCount();
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande:', error);
      set({ error: 'Erreur lors de la création de la demande' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  approveRequest: async (id, createAccount) => {
    set({ loading: true, error: null });
    try {
      const request = get().requests.find(r => r.id === id);
      if (!request) throw new Error('Demande introuvable');

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Non authentifié');

      let createdUserId: string | undefined;

      if (createAccount) {
        const { data: newUser, error: userError } = await supabase.from('users').insert({
          email: request.email,
          first_name: request.first_name,
          last_name: request.last_name,
          role: request.requested_role,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).select().single();

        if (userError) throw userError;
        createdUserId = newUser.id;

        if (request.company_name && request.requested_role === 'partner_company') {
          await supabase.from('companies').insert({
            name: request.company_name,
            email: request.email,
            phone: request.phone || '',
            siret: request.siret || '',
            type: 'partner',
            status: 'active',
            verification_status: 'verified',
            created_by: createdUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({
          status: 'approved',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          created_user_id: createdUserId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await get().fetchRequests();
      await get().fetchPendingCount();

      return { userId: createdUserId, success: true };
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error);
      set({ error: 'Erreur lors de l\'approbation de la demande' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectRequest: async (id, reason) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'rejected',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await get().fetchRequests();
      await get().fetchPendingCount();
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      set({ error: 'Erreur lors du rejet de la demande' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
