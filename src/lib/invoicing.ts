import { supabase } from './supabase';

export interface InvoiceData {
  projectId: string;
  counterpartyType: 'partner_company' | 'client';
  counterpartyId: string;
  amountHT: number;
  tvaRate?: number;
  dueDate?: Date;
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  amountHT: number;
  tvaRate: number;
  amountTTC: number;
  dueDate?: string;
  issuedAt?: string;
  paidAt?: string;
  bankReference?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: 'transfer';
  amount: number;
  paidAt: string;
  bankReference?: string;
  attachmentUrl?: string;
  notes?: string;
}

/**
 * Génère un numéro de facture unique
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur génération numéro facture:', error);
    // Fallback en cas d'erreur
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `FCT-${year}${month}-${timestamp}`;
  }
};

/**
 * Crée une nouvelle facture
 */
export const createInvoice = async (invoiceData: InvoiceData): Promise<Invoice> => {
  try {
    const number = await generateInvoiceNumber();
    const tvaRate = invoiceData.tvaRate || 20.0;
    const amountTTC = invoiceData.amountHT * (1 + tvaRate / 100);
    
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        project_id: invoiceData.projectId,
        counterparty_type: invoiceData.counterpartyType,
        counterparty_id: invoiceData.counterpartyId,
        number,
        amount_ht: invoiceData.amountHT,
        tva_rate: tvaRate,
        amount_ttc: amountTTC,
        due_date: invoiceData.dueDate?.toISOString().split('T')[0],
        notes: invoiceData.notes,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      number: data.number,
      status: data.status,
      amountHT: data.amount_ht,
      tvaRate: data.tva_rate,
      amountTTC: data.amount_ttc,
      dueDate: data.due_date,
      issuedAt: data.issued_at,
      paidAt: data.paid_at,
      bankReference: data.bank_reference,
      pdfUrl: data.pdf_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Erreur création facture:', error);
    throw error;
  }
};

/**
 * Génère le PDF d'une facture
 */
export const generateInvoicePDF = async (invoiceId: string): Promise<string> => {
  try {
    // Récupérer les données de la facture
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        project:project_id(*),
        counterparty:counterparty_id(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    // En production, utiliser pdfmake ou une librairie similaire
    // Pour l'instant, simuler la génération
    const pdfContent = {
      title: `Facture ${invoice.number}`,
      amount: invoice.amount_ttc,
      dueDate: invoice.due_date,
      generatedAt: new Date().toISOString()
    };

    // Simuler l'upload vers Supabase Storage
    const fileName = `invoices/${new Date().getFullYear()}/${invoice.number}.pdf`;
    const pdfUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documents/${fileName}`;

    // Mettre à jour la facture avec l'URL du PDF
    await supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('id', invoiceId);

    return pdfUrl;
  } catch (error) {
    console.error('Erreur génération PDF facture:', error);
    throw error;
  }
};

/**
 * Émet une facture (change le statut de draft à issued)
 */
export const issueInvoice = async (invoiceId: string): Promise<void> => {
  try {
    // Générer le PDF
    const pdfUrl = await generateInvoicePDF(invoiceId);

    // Mettre à jour le statut
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'issued',
        issued_at: new Date().toISOString(),
        pdf_url: pdfUrl
      })
      .eq('id', invoiceId);

    if (error) throw error;

    // Envoyer l'email de notification
    await sendInvoiceEmail(invoiceId);
  } catch (error) {
    console.error('Erreur émission facture:', error);
    throw error;
  }
};

/**
 * Marque une facture comme payée
 */
export const markInvoiceAsPaid = async (
  invoiceId: string,
  paymentData: {
    amount: number;
    paidAt: Date;
    bankReference?: string;
    attachmentUrl?: string;
    notes?: string;
  }
): Promise<void> => {
  try {
    // Créer l'enregistrement de paiement
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        method: 'transfer',
        amount: paymentData.amount,
        paid_at: paymentData.paidAt.toISOString().split('T')[0],
        bank_reference: paymentData.bankReference,
        attachment_url: paymentData.attachmentUrl,
        notes: paymentData.notes
      });

    if (paymentError) throw paymentError;

    // Récupérer le montant total de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('amount_ttc')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    // Déterminer le nouveau statut
    const newStatus = paymentData.amount >= invoice.amount_ttc ? 'paid' : 'partially_paid';

    // Mettre à jour la facture
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        bank_reference: paymentData.bankReference
      })
      .eq('id', invoiceId);

    if (updateError) throw updateError;

    // Si complètement payée, déclencher les commissions
    if (newStatus === 'paid') {
      await triggerCommissions(invoiceId);
    }

    // Envoyer email de confirmation
    await sendPaymentConfirmationEmail(invoiceId, paymentData.amount);
  } catch (error) {
    console.error('Erreur marquage paiement:', error);
    throw error;
  }
};

/**
 * Déclenche le calcul des commissions après paiement
 */
const triggerCommissions = async (invoiceId: string): Promise<void> => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        project:project_id(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    // Calculer les commissions
    const { data: commissionData, error: commissionError } = await supabase
      .rpc('calculate_commissions', {
        p_project_id: invoice.project_id,
        p_amount_ttc: invoice.amount_ttc,
        p_tva_rate: invoice.tva_rate
      });

    if (commissionError) throw commissionError;

    // Insérer les commissions calculées
    const { error: insertError } = await supabase
      .from('commissions_new')
      .insert({
        project_id: invoice.project_id,
        temi_amount: commissionData.temi,
        apporteur_amount: commissionData.apporteur,
        mandatary_amount: commissionData.mandatary,
        status: 'payable',
        payable_from: new Date().toISOString().split('T')[0]
      });

    if (insertError) throw insertError;

    console.log('✅ Commissions déclenchées pour la facture', invoice.number);
  } catch (error) {
    console.error('Erreur déclenchement commissions:', error);
    throw error;
  }
};

/**
 * Envoie l'email de facture émise
 */
const sendInvoiceEmail = async (invoiceId: string): Promise<void> => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        project:project_id(*),
        counterparty:counterparty_id(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: invoice.counterparty?.email,
        subject: `Facture ${invoice.number} - TEMI Construction`,
        template: 'invoiceIssued',
        data: {
          invoiceNumber: invoice.number,
          amount: invoice.amount_ttc,
          dueDate: new Date(invoice.due_date).toLocaleDateString('fr-FR'),
          pdfUrl: invoice.pdf_url
        }
      })
    });
  } catch (error) {
    console.error('Erreur envoi email facture:', error);
  }
};

/**
 * Envoie l'email de confirmation de paiement
 */
const sendPaymentConfirmationEmail = async (invoiceId: string, amount: number): Promise<void> => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        counterparty:counterparty_id(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: invoice.counterparty?.email,
        subject: `Paiement reçu - Facture ${invoice.number}`,
        template: 'paymentReceived',
        data: {
          invoiceNumber: invoice.number,
          amount: amount,
          bankReference: invoice.bank_reference
        }
      })
    });
  } catch (error) {
    console.error('Erreur envoi email paiement:', error);
  }
};