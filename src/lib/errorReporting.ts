interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  userRole?: string;
  additionalContext?: Record<string, any>;
}

export class ErrorReporting {
  private static instance: ErrorReporting;
  private isEnabled: boolean;
  private sentryDsn?: string;

  private constructor() {
    this.isEnabled = import.meta.env.VITE_ENVIRONMENT === 'production';
    this.sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    this.initializeErrorHandling();
  }

  public static getInstance(): ErrorReporting {
    if (!ErrorReporting.instance) {
      ErrorReporting.instance = new ErrorReporting();
    }
    return ErrorReporting.instance;
  }

  private initializeErrorHandling(): void {
    // Capturer les erreurs JavaScript non gérées
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        additionalContext: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Capturer les promesses rejetées non gérées
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        additionalContext: {
          type: 'unhandledrejection',
          reason: event.reason,
        },
      });
    });

    // Capturer les erreurs de ressources
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.reportError({
          message: `Resource loading error: ${(event.target as any)?.src || 'unknown'}`,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          additionalContext: {
            type: 'resource_error',
            element: (event.target as any)?.tagName,
            src: (event.target as any)?.src,
          },
        });
      }
    }, true);
  }

  public reportError(errorReport: Partial<ErrorReport>): void {
    const fullReport: ErrorReport = {
      message: errorReport.message || 'Unknown error',
      stack: errorReport.stack,
      url: errorReport.url || window.location.href,
      userAgent: errorReport.userAgent || navigator.userAgent,
      timestamp: errorReport.timestamp || new Date().toISOString(),
      userId: errorReport.userId,
      userRole: errorReport.userRole,
      additionalContext: errorReport.additionalContext,
    };

    // Log en console pour le développement
    if (import.meta.env.DEV) {
      console.error('🐛 Erreur rapportée:', fullReport);
    }

    // Envoyer à Sentry en production
    if (this.isEnabled && this.sentryDsn) {
      this.sendToSentry(fullReport);
    }

    // Stocker localement pour analyse
    this.storeLocalError(fullReport);
  }

  private async sendToSentry(errorReport: ErrorReport): Promise<void> {
    try {
      // En production, utiliser le SDK Sentry
      // Pour l'instant, simuler l'envoi
      console.log('📡 Erreur envoyée à Sentry:', errorReport.message);
    } catch (error) {
      console.error('Erreur envoi Sentry:', error);
    }
  }

  private storeLocalError(errorReport: ErrorReport): void {
    try {
      const errors = JSON.parse(localStorage.getItem('temi_errors') || '[]');
      errors.push(errorReport);
      
      // Garder seulement les 50 dernières erreurs
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('temi_errors', JSON.stringify(errors));
    } catch (error) {
      console.error('Erreur stockage local:', error);
    }
  }

  public getLocalErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('temi_errors') || '[]');
    } catch (error) {
      console.error('Erreur lecture erreurs locales:', error);
      return [];
    }
  }

  public clearLocalErrors(): void {
    localStorage.removeItem('temi_errors');
  }

  // Méthodes utilitaires pour reporter des erreurs spécifiques
  public reportSupabaseError(error: any, context?: Record<string, any>): void {
    this.reportError({
      message: `Supabase Error: ${error.message}`,
      stack: error.stack,
      additionalContext: {
        type: 'supabase_error',
        code: error.code,
        details: error.details,
        hint: error.hint,
        ...context,
      },
    });
  }

  public reportAPIError(url: string, status: number, response: any): void {
    this.reportError({
      message: `API Error: ${status} ${url}`,
      additionalContext: {
        type: 'api_error',
        url,
        status,
        response,
      },
    });
  }

  public reportUserAction(action: string, success: boolean, context?: Record<string, any>): void {
    if (!success) {
      this.reportError({
        message: `User Action Failed: ${action}`,
        additionalContext: {
          type: 'user_action_error',
          action,
          ...context,
        },
      });
    }
  }
}

// Instance singleton
export const errorReporting = ErrorReporting.getInstance();

// Hook pour utiliser le reporting d'erreurs
export const useErrorReporting = () => {
  return {
    reportError: errorReporting.reportError.bind(errorReporting),
    reportSupabaseError: errorReporting.reportSupabaseError.bind(errorReporting),
    reportAPIError: errorReporting.reportAPIError.bind(errorReporting),
    reportUserAction: errorReporting.reportUserAction.bind(errorReporting),
    getLocalErrors: errorReporting.getLocalErrors.bind(errorReporting),
    clearLocalErrors: errorReporting.clearLocalErrors.bind(errorReporting),
  };
};