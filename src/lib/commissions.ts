import { supabase } from './supabase';

export interface CommissionCalculation {
  temi: number;
  apporteur: number;
  mandatary: number;
  mandataryRate: number;
  total: number;
}

export interface Commission {
  id: string;
  projectId: string;
  temiAmount: number;
  apporteurAmount: number;
  mandataryAmount: number;
  status: 'pending' | 'due' | 'payable' | 'paid';
  calculatedAt: string;
  payableFrom?: string;
  paidAt?: string;
  documentsUrl?: string;
}

/**
 * Calcule les commissions pour un projet
 */
export const calculateCommissions = async (
  projectId: string,
  amountTTC: number,
  tvaRate: number = 20.0
): Promise<CommissionCalculation> => {
  try {
    const { data, error } = await supabase.rpc('calculate_commissions', {
      p_project_id: projectId,
      p_amount_ttc: amountTTC,
      p_tva_rate: tvaRate
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur calcul commissions:', error);
    throw error;
  }
};

/**
 * Récupère les commissions d'un utilisateur
 */
export const getUserCommissions = async (userId: string): Promise<Commission[]> => {
  try {
    const { data, error } = await supabase
      .from('commissions_new')
      .select(`
        *,
        project:project_id(title, client_id)
      `)
      .or(`project.agent_id.eq.${userId},project.business_provider_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      projectId: item.project_id,
      temiAmount: item.temi_amount,
      apporteurAmount: item.apporteur_amount,
      mandataryAmount: item.mandatary_amount,
      status: item.status,
      calculatedAt: item.calculated_at,
      payableFrom: item.payable_from,
      paidAt: item.paid_at,
      documentsUrl: item.documents_url
    }));
  } catch (error) {
    console.error('Erreur récupération commissions:', error);
    return [];
  }
};

/**
 * Marque les commissions comme payées
 */
export const markCommissionsAsPaid = async (
  commissionIds: string[],
  paidAt: Date,
  documentsUrl?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('commissions_new')
      .update({
        status: 'paid',
        paid_at: paidAt.toISOString().split('T')[0],
        documents_url: documentsUrl
      })
      .in('id', commissionIds);

    if (error) throw error;

    // Envoyer les notifications de paiement
    for (const commissionId of commissionIds) {
      await sendCommissionPaidNotification(commissionId);
    }
  } catch (error) {
    console.error('Erreur marquage commissions payées:', error);
    throw error;
  }
};

/**
 * Génère le PDF de note de commission
 */
export const generateCommissionPDF = async (commissionId: string): Promise<string> => {
  try {
    const { data: commission, error } = await supabase
      .from('commissions_new')
      .select(`
        *,
        project:project_id(
          title,
          amount,
          client:client_id(first_name, last_name),
          agent:agent_id(first_name, last_name),
          business_provider:business_provider_id(name)
        )
      `)
      .eq('id', commissionId)
      .single();

    if (error) throw error;

    // En production, utiliser pdfmake pour générer le PDF
    const pdfContent = {
      title: `Note de commission - ${commission.project.title}`,
      commissions: {
        temi: commission.temi_amount,
        apporteur: commission.apporteur_amount,
        mandatary: commission.mandatary_amount
      },
      project: commission.project,
      generatedAt: new Date().toISOString()
    };

    // Simuler l'upload vers Supabase Storage
    const fileName = `commissions/${new Date().getFullYear()}/commission_${commissionId}.pdf`;
    const pdfUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documents/${fileName}`;

    // Mettre à jour la commission avec l'URL du PDF
    await supabase
      .from('commissions_new')
      .update({ documents_url: pdfUrl })
      .eq('id', commissionId);

    return pdfUrl;
  } catch (error) {
    console.error('Erreur génération PDF commission:', error);
    throw error;
  }
};

/**
 * Envoie la notification de commission payée
 */
const sendCommissionPaidNotification = async (commissionId: string): Promise<void> => {
  try {
    const { data: commission, error } = await supabase
      .from('commissions_new')
      .select(`
        *,
        project:project_id(
          title,
          agent:agent_id(first_name, last_name, email),
          business_provider:business_provider_id(name, email)
        )
      `)
      .eq('id', commissionId)
      .single();

    if (error) throw error;

    // Notifier le mandataire
    if (commission.mandatary_amount > 0 && commission.project.agent) {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: commission.project.agent.email,
          subject: 'Commission versée - TEMI Construction',
          template: 'commissionTriggered',
          data: {
            firstName: commission.project.agent.first_name,
            amount: commission.mandatary_amount,
            projectTitle: commission.project.title,
            paymentDate: new Date().toLocaleDateString('fr-FR')
          }
        })
      });
    }

    // Notifier l'apporteur
    if (commission.apporteur_amount > 0 && commission.project.business_provider) {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: commission.project.business_provider.email,
          subject: 'Commission versée - TEMI Construction',
          template: 'commissionTriggered',
          data: {
            firstName: commission.project.business_provider.name,
            amount: commission.apporteur_amount,
            projectTitle: commission.project.title,
            paymentDate: new Date().toLocaleDateString('fr-FR')
          }
        })
      });
    }
  } catch (error) {
    console.error('Erreur notification commission:', error);
  }
};