import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/** Helper: génère un id pour éviter le default auth.uid() côté DB */
const genId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  user_id: string;
  user: User;
  company_name?: string;
  siret?: string;
  phone?: string;
  address: {
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ClientFormData {
  type: 'individual' | 'couple' | 'company';
  user_first_name: string;
  user_last_name: string;
  spouse_first_name?: string;
  spouse_last_name?: string;
  company_name?: string;
  siret?: string;
  user_email: string;
  phone?: string;
  address: {
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  notes?: string;
}

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  createClient: (clientData: ClientFormData) => Promise<Client>;
  updateClient: (id: string, updates: Partial<ClientFormData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(
          `
          *,
          user:user_id(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ clients: (data || []) as Client[], error: null });
    } catch (err: any) {
      console.error('fetchClients failed:', err?.message || err);
      set({ clients: [], error: 'Impossible de charger les clients' });
    } finally {
      set({ loading: false });
    }
  },

  createClient: async (clientData) => {
    set({ loading: true, error: null });

    try {
      // 1) Retrouver un user par email (s'il existe déjà)
      const { data: existingUser, error: findErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', clientData.user_email)
        .maybeSingle();
      if (findErr) throw new Error(`Find user failed: ${findErr.message}`);

      // 2) Déterminer/Créer l'id utilisateur à lier
      let userId: string;
      if (existingUser?.id) {
        userId = existingUser.id;
      } else {
        const newId = genId();
        const { data: upsertUser, error: upsertErr } = await supabase
          .from('users')
          .upsert(
            {
              id: newId, // IMPORTANT: on force un id neuf (pas le default auth.uid())
              email: clientData.user_email,
              first_name: clientData.user_first_name,
              last_name: clientData.user_last_name,
              role: 'client',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email', ignoreDuplicates: false }
          )
          .select('id')
          .single();
        if (upsertErr) throw new Error(`Upsert user failed: ${upsertErr.message}`);
        userId = upsertUser.id;
      }

      // 3) Créer le client lié à userId
      const { data: clientRecord, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          company_name: clientData.company_name || null,
          siret: clientData.siret || null,
          phone: clientData.phone || null,
          address: clientData.address || {}, // jsonb
          notes: clientData.notes || null,
        })
        .select(`*, user:user_id(*)`)
        .single();

      if (clientError) throw new Error(`Could not create client: ${clientError.message}`);
      const record = clientRecord as Client;

      // 4) Mettre à jour la liste locale
      const clients = get().clients;
      set({ clients: [record, ...clients], error: null });

      return record;
    } catch (err: any) {
      console.error('createClient failed:', err?.message || err);
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création du client';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const client = get().clients.find(c => c.id === id);
      if (!client) throw new Error('Client non trouvé');

      // Mise à jour éventuelle du user lié
      if (updates.user_first_name || updates.user_last_name || updates.user_email) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            ...(updates.user_first_name && { first_name: updates.user_first_name }),
            ...(updates.user_last_name && { last_name: updates.user_last_name }),
            ...(updates.user_email && { email: updates.user_email }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', client.user_id);
        if (userError) console.warn('Could not update user in Supabase:', userError);
      }

      // Mise à jour du client
      const clientUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.company_name !== undefined) clientUpdates.company_name = updates.company_name;
      if (updates.siret !== undefined) clientUpdates.siret = updates.siret;
      if (updates.phone !== undefined) clientUpdates.phone = updates.phone;
      if (updates.address !== undefined) clientUpdates.address = updates.address;
      if (updates.notes !== undefined) clientUpdates.notes = updates.notes;

      const { error: clientError } = await supabase
        .from('clients')
        .update(clientUpdates)
        .eq('id', id);
      if (clientError) console.warn('Could not update client in Supabase:', clientError);

      // Local
      const clients = get().clients.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...(updates.company_name !== undefined && { company_name: updates.company_name }),
            ...(updates.siret !== undefined && { siret: updates.siret }),
            ...(updates.phone !== undefined && { phone: updates.phone }),
            ...(updates.address !== undefined && { address: updates.address }),
            ...(updates.notes !== undefined && { notes: updates.notes }),
            user: {
              ...c.user,
              ...(updates.user_first_name && { first_name: updates.user_first_name }),
              ...(updates.user_last_name && { last_name: updates.user_last_name }),
              ...(updates.user_email && { email: updates.user_email }),
            },
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      });
      set({ clients, error: null });
    } catch (err) {
      console.error('updateClient failed:', err);
      set({ error: 'Erreur lors de la mise à jour du client' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) console.warn('Could not delete client in Supabase:', error);

      const clients = get().clients.filter(c => c.id !== id);
      set({ clients, error: null });
    } catch (err) {
      console.error('deleteClient failed:', err);
      set({ error: 'Erreur lors de la suppression du client' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
