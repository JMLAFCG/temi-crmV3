import { supabase } from './supabase';

export interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: string;
}

export class WebhookManager {
  private static instance: WebhookManager;
  private endpoints: WebhookEndpoint[] = [];

  private constructor() {
    this.loadWebhookEndpoints();
  }

  public static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager();
    }
    return WebhookManager.instance;
  }

  private async loadWebhookEndpoints(): Promise<void> {
    try {
      // En production, charger depuis la base de données
      // Pour l'instant, utiliser des endpoints de démonstration
      this.endpoints = [
        {
          id: 'webhook-1',
          url: 'https://api.example.com/webhooks/temi',
          events: ['project.created', 'project.completed', 'invoice.paid'],
          secret: 'webhook_secret_key',
          active: true,
          created_at: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Erreur chargement webhooks:', error);
    }
  }

  public async sendWebhook(event: string, data: any, source = 'temi-crm'): Promise<void> {
    const webhookEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      event,
      data,
      timestamp: new Date().toISOString(),
      source,
    };

    const relevantEndpoints = this.endpoints.filter(
      endpoint => endpoint.active && endpoint.events.includes(event)
    );

    const promises = relevantEndpoints.map(endpoint =>
      this.deliverWebhook(endpoint, webhookEvent)
    );

    try {
      await Promise.allSettled(promises);
      console.log(`📡 Webhook ${event} envoyé à ${relevantEndpoints.length} endpoints`);
    } catch (error) {
      console.error('Erreur envoi webhooks:', error);
    }
  }

  private async deliverWebhook(
    endpoint: WebhookEndpoint,
    event: WebhookEvent
  ): Promise<void> {
    try {
      // Générer la signature HMAC
      const signature = await this.generateSignature(
        JSON.stringify(event),
        endpoint.secret
      );

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TEMI-Signature': signature,
          'X-TEMI-Event': event.event,
          'User-Agent': 'TEMI-Construction-Webhook/1.0',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Webhook ${event.event} livré à ${endpoint.url}`);
    } catch (error) {
      console.error(`❌ Erreur livraison webhook à ${endpoint.url}:`, error);
      
      // En production, implémenter un système de retry
      // et stocker les échecs pour analyse
    }
  }

  private async generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `sha256=${hashHex}`;
  }

  // Méthodes utilitaires pour les événements courants
  public async notifyProjectCreated(projectData: any): Promise<void> {
    await this.sendWebhook('project.created', {
      project: projectData,
      timestamp: new Date().toISOString(),
    });
  }

  public async notifyProjectCompleted(projectData: any): Promise<void> {
    await this.sendWebhook('project.completed', {
      project: projectData,
      completion_date: new Date().toISOString(),
    });
  }

  public async notifyInvoicePaid(invoiceData: any): Promise<void> {
    await this.sendWebhook('invoice.paid', {
      invoice: invoiceData,
      payment_date: new Date().toISOString(),
    });
  }

  public async notifyCommissionTriggered(commissionData: any): Promise<void> {
    await this.sendWebhook('commission.triggered', {
      commission: commissionData,
      triggered_at: new Date().toISOString(),
    });
  }

  public async notifyDocumentExpiring(documentData: any): Promise<void> {
    await this.sendWebhook('document.expiring', {
      document: documentData,
      expiry_date: documentData.expiry_date,
      days_until_expiry: documentData.days_until_expiry,
    });
  }
}

// Instance singleton
export const webhookManager = WebhookManager.getInstance();