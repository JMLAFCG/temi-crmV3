export class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializePWA();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator && !window.location.hostname.includes('stackblitz')) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker enregistré');

        // Écouter les mises à jour
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        // Silently fail in development environments
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Service Worker non disponible en développement');
        } else {
          console.error('❌ Erreur enregistrement Service Worker:', error);
        }
      }
    }

    // Demander la permission pour les notifications
    this.requestNotificationPermission();
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log(`🔔 Permission notifications: ${permission}`);
      } catch (error) {
        console.error('Erreur permission notifications:', error);
      }
    }
  }

  private showUpdateAvailable(): void {
    // Créer une notification pour informer de la mise à jour
    const updateBanner = document.createElement('div');
    updateBanner.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    updateBanner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div>
          <p class="font-medium">Mise à jour disponible</p>
          <p class="text-sm opacity-90">Une nouvelle version est prête</p>
        </div>
        <button id="update-app" class="bg-white text-blue-600 px-3 py-1 rounded font-medium">
          Mettre à jour
        </button>
        <button id="dismiss-update" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Gérer les clics
    document.getElementById('update-app')?.addEventListener('click', () => {
      this.updateApp();
      updateBanner.remove();
    });

    document.getElementById('dismiss-update')?.addEventListener('click', () => {
      updateBanner.remove();
    });

    // Auto-dismiss après 10 secondes
    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.remove();
      }
    }, 10000);
  }

  private async updateApp(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  public async checkForUpdates(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.error('Erreur vérification mises à jour:', error);
      }
    }
  }

  public isInstalled(): boolean {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    return isStandalone || isInWebAppiOS;
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          ...options,
        });

        // Auto-close après 5 secondes
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Erreur affichage notification:', error);
      }
    }
  }
}

// Instance singleton
export const pwaManager = PWAManager.getInstance();