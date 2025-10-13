interface MetricEvent {
  name: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
}

interface MetricsConfig {
  enabled: boolean;
  sentryDsn?: string;
  environment: string;
}

class MetricsLogger {
  private config: MetricsConfig;
  private events: MetricEvent[] = [];

  constructor() {
    this.config = {
      enabled: import.meta.env.VITE_ENVIRONMENT !== 'development',
      sentryDsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development'
    };

    // Initialiser Sentry si configuré
    if (this.config.sentryDsn && this.config.enabled) {
      this.initSentry();
    }
  }

  private async initSentry() {
    try {
      // En production, importer et configurer Sentry
      console.log('📊 Metrics logger initialisé avec Sentry');
    } catch (error) {
      console.warn('⚠️ Erreur initialisation Sentry:', error);
    }
  }

  /**
   * Enregistre un événement métrique
   */
  track(name: string, properties?: Record<string, any>, value?: number): void {
    if (!this.config.enabled) {
      console.log('📊 Metric (dev):', name, properties, value);
      return;
    }

    const event: MetricEvent = {
      name,
      value,
      properties: {
        ...properties,
        environment: this.config.environment,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      userId: properties?.userId
    };

    this.events.push(event);

    // Envoyer à Sentry ou autre service
    this.sendToSentry(event);
  }

  /**
   * Enregistre une erreur
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });

    if (this.config.enabled) {
      console.error('📊 Error tracked:', error, context);
    }
  }

  /**
   * Enregistre une action utilisateur
   */
  trackUserAction(action: string, userId: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      userId,
      ...properties
    });
  }

  /**
   * Enregistre une performance
   */
  trackPerformance(name: string, duration: number, properties?: Record<string, any>): void {
    this.track('performance', {
      name,
      duration,
      ...properties
    }, duration);
  }

  /**
   * Enregistre un événement business
   */
  trackBusiness(event: string, properties?: Record<string, any>): void {
    this.track('business', {
      event,
      ...properties
    });
  }

  private sendToSentry(event: MetricEvent): void {
    // En production, envoyer à Sentry
    if (this.config.sentryDsn) {
      // Sentry.addBreadcrumb({ message: event.name, data: event.properties });
    }
  }

  /**
   * Récupère les métriques locales (développement)
   */
  getLocalEvents(): MetricEvent[] {
    return [...this.events];
  }

  /**
   * Nettoie les événements anciens
   */
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.events = this.events.filter(event => 
      !event.timestamp || event.timestamp > oneHourAgo
    );
  }
}

// Instance singleton
export const metrics = new MetricsLogger();

// Helpers pour les métriques courantes
export const trackPageView = (page: string, userId?: string) => {
  metrics.trackUserAction('page_view', userId || 'anonymous', { page });
};

export const trackProjectCreated = (projectId: string, userId: string) => {
  metrics.trackBusiness('project_created', { projectId, userId });
};

export const trackInvoiceIssued = (invoiceId: string, amount: number) => {
  metrics.trackBusiness('invoice_issued', { invoiceId, amount });
};

export const trackCommissionPaid = (commissionId: string, amount: number, type: string) => {
  metrics.trackBusiness('commission_paid', { commissionId, amount, type });
};

export const trackAIAnalysis = (documentId: string, confidence: number, processingTime: number) => {
  metrics.trackBusiness('ai_analysis', { documentId, confidence });
  metrics.trackPerformance('ai_processing', processingTime, { documentId });
};