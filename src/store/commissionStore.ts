import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Commission {
  id: string;
  project_id: string;
  provider_id: string;
  provider_type: 'business_provider' | 'partner_company';
  project_title: string;
  client_name: string;
  provider_name: string;
  project_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'cancelled';
  project_status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  quote_status: 'draft' | 'sent' | 'signed' | 'rejected';
  down_payment_status: 'pending' | 'received_by_temi' | 'transferred_to_company';
  invoice_date?: string;
  payment_date?: string;
  due_date?: string;
  quote_signed_date?: string;
  down_payment_date?: string;
  created_at: string;
  updated_at: string;
}

interface CommissionState {
  commissions: Commission[];
  loading: boolean;
  error: string | null;
  fetchCommissions: () => Promise<void>;
  updateCommissionStatus: (
    id: string,
    status: Commission['status'],
    paymentDate?: string
  ) => Promise<void>;
  generateInvoices: (commissionIds: string[]) => Promise<void>;
  calculateCommissions: (projectId: string) => Promise<void>;
}

export const useCommissionStore = create<CommissionState>((set, get) => ({
  commissions: [],
  loading: false,
  error: null,

  fetchCommissions: async () => {
    set({ loading: true, error: null });
    try {
      // En production, récupérer depuis Supabase avec jointures
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          id,
          title,
          amount,
          commission_amount,
          commission_rate,
          billing_status,
          status,
          business_provider_id,
          client:client_id(first_name, last_name),
          business_provider:business_provider_id(name),
          created_at,
          updated_at
        `
        )
        .not('business_provider_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erreur Supabase, utilisation des données mock:', error);
        // Utiliser des données mock en cas d'erreur
        set({ commissions: [], error: null });
        return;
      }

      // Transformer les données pour correspondre à l'interface Commission
      const commissions = (data || []).map(project => ({
        id: project.id,
        project_id: project.id,
        provider_id: project.business_provider_id,
        provider_type: 'business_provider' as const,
        project_title: project.title,
        client_name: project.client
          ? `${project.client.first_name} ${project.client.last_name}`
          : 'Client inconnu',
        provider_name: project.business_provider?.name || 'Apporteur inconnu',
        project_amount: project.amount || 0,
        commission_rate: project.commission_rate || 10,
        commission_amount: project.commission_amount || 0,
        status:
          project.billing_status === 'paid'
            ? 'paid'
            : project.billing_status === 'invoiced'
              ? 'invoiced'
              : 'pending',
        project_status: project.status,
        quote_status: 'draft',
        down_payment_status: 'pending',
        quote_signed_date: undefined,
        down_payment_date: undefined,
        created_at: project.created_at,
        updated_at: project.updated_at,
      }));

      set({ commissions, error: null });
    } catch (error) {
      console.error('Erreur lors de la récupération des commissions:', error);
      set({ error: 'Erreur lors de la récupération des commissions' });
    } finally {
      set({ loading: false });
    }
  },

  updateCommissionStatus: async (id, status, paymentDate) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {
        billing_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'paid' && paymentDate) {
        updateData.payment_date = paymentDate;
      }

      if (status === 'invoiced') {
        updateData.invoice_date = new Date().toISOString();
        // Calculer la date d'échéance (30 jours)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        updateData.due_date = dueDate.toISOString();
      }

      const { error } = await supabase.from('projects').update(updateData).eq('id', id);

      if (error) throw error;

      // Mettre à jour localement
      const commissions = get().commissions.map(c =>
        c.id === id
          ? {
              ...c,
              status,
              ...(paymentDate && { payment_date: paymentDate }),
              ...(status === 'invoiced' && {
                invoice_date: new Date().toISOString(),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              }),
            }
          : c
      );
      set({ commissions, error: null });

      // Si la commission est payée, mettre à jour les statistiques de l'apporteur
      if (status === 'paid') {
        const commission = commissions.find(c => c.id === id);
        if (commission) {
          await updateProviderStats(commission.provider_id, commission.commission_amount);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      set({ error: 'Erreur lors de la mise à jour du statut' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generateInvoices: async commissionIds => {
    set({ loading: true, error: null });
    try {
      // Logique de génération de factures
      for (const id of commissionIds) {
        await get().updateCommissionStatus(id, 'invoiced');
      }
    } catch (error) {
      console.error('Erreur lors de la génération des factures:', error);
      set({ error: 'Erreur lors de la génération des factures' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateCommissions: async projectId => {
    set({ loading: true, error: null });
    try {
      // Récupérer les informations du projet
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      if (project.business_provider_id && project.amount) {
        const baseCommissionRate = 0.12; // 12% de commission de base
        const providerCommissionRate = 0.1; // 10% pour l'apporteur

        const totalCommission = project.amount * baseCommissionRate;
        const providerCommission = totalCommission * providerCommissionRate;

        // Mettre à jour le projet avec les commissions calculées
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            commission_amount: providerCommission,
            commission_rate: providerCommissionRate * 100,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Erreur lors du calcul des commissions:', error);
      set({ error: 'Erreur lors du calcul des commissions' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

// Fonction utilitaire pour mettre à jour les statistiques de l'apporteur
const updateProviderStats = async (providerId: string, commissionAmount: number) => {
  try {
    const { error } = await supabase
      .from('business_providers')
      .update({
        total_commissions: supabase.raw(`total_commissions + ${commissionAmount}`),
        pending_commissions: supabase.raw(`pending_commissions - ${commissionAmount}`),
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId);

    if (error) {
      console.warn('Could not update provider stats:', error);
    }
  } catch (error) {
    console.warn('Error updating provider stats:', error);
  }
};
