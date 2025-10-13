import { supabase } from './supabase';
import { EmailTemplates, EmailTemplateData } from '../components/email/EmailTemplates';

export interface EmailOptions {
  to: string;
  subject: string;
  template: keyof typeof EmailTemplates;
  data: EmailTemplateData;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export class EmailService {
  private static instance: EmailService;
  private isConfigured = false;

  private constructor() {
    this.checkConfiguration();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private checkConfiguration(): void {
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    this.isConfigured = requiredEnvVars.every(envVar => 
      import.meta.env[envVar] && import.meta.env[envVar] !== ''
    );

    if (!this.isConfigured) {
      console.warn('⚠️ Service email non configuré - Variables d\'environnement manquantes');
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.warn('📧 Email simulé (service non configuré):', options.subject);
        return true;
      }

      // Générer le HTML depuis le template
      const htmlContent = EmailTemplates[options.template](options.data);

      // Appeler l'Edge Function d'envoi d'email
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: options.to,
            subject: options.subject,
            html: htmlContent,
            template: options.template,
            data: options.data,
            attachments: options.attachments,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue');
      }

      console.log('✅ Email envoyé avec succès:', options.subject);
      return true;

    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      
      // En développement, simuler le succès pour ne pas bloquer
      if (import.meta.env.DEV) {
        console.log('📧 Email simulé en développement:', options.subject);
        return true;
      }
      
      return false;
    }
  }

  // Méthodes utilitaires pour les emails courants
  public async sendWelcomeEmail(userEmail: string, userData: EmailTemplateData): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Bienvenue sur TEMI-Construction',
      template: 'welcome',
      data: {
        ...userData,
        loginUrl: `${window.location.origin}/login`,
      },
    });
  }

  public async sendDocumentExpiringEmail(
    userEmail: string,
    documentName: string,
    expiryDate: string,
    userData: EmailTemplateData
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: `Document expirant - ${documentName}`,
      template: 'documentExpiring',
      data: {
        ...userData,
        documentName,
        expiryDate,
      },
    });
  }

  public async sendCommissionTriggeredEmail(
    userEmail: string,
    commissionData: EmailTemplateData
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Commission déclenchée - TEMI Construction',
      template: 'commissionTriggered',
      data: commissionData,
    });
  }

  public async sendInvoiceIssuedEmail(
    userEmail: string,
    invoiceData: EmailTemplateData
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: `Facture ${invoiceData.invoiceNumber} - TEMI Construction`,
      template: 'invoiceIssued',
      data: invoiceData,
    });
  }

  public async sendPaymentReceivedEmail(
    userEmail: string,
    paymentData: EmailTemplateData
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: `Paiement reçu - Facture ${paymentData.invoiceNumber}`,
      template: 'paymentReceived',
      data: paymentData,
    });
  }
}

// Instance singleton
export const emailService = EmailService.getInstance();