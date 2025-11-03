import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Démarrage TEMI CRM');

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Forcer la mise à jour du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Récupérer tous les service workers
    const registrations = await navigator.serviceWorker.getRegistrations();

    // Si un ancien service worker existe, le supprimer
    for (const registration of registrations) {
      console.log('🔄 Mise à jour du Service Worker...');
      await registration.unregister();
    }

    // Vider tous les caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => {
        console.log('🗑️ Suppression cache:', name);
        return caches.delete(name);
      }));
    }

    // Réenregistrer la nouvelle version
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('✅ Service Worker enregistré (version 2)');
      // Forcer l'activation immédiate
      registration.update();
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  });
}
