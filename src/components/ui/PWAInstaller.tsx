import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Afficher le banner après 30 secondes si pas installé
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Écouter l'installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installée');
      } else {
        console.log('❌ Installation PWA refusée');
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Erreur installation PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Ne plus afficher pendant cette session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou si dismissé
  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  // Ne pas afficher si déjà dismissé dans cette session
  if (sessionStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Installer TEMI-Construction
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Accédez rapidement à l'application depuis votre écran d'accueil
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={handleInstallClick}
              >
                Installer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
              >
                Plus tard
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};