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

// Service Worker avec mise à jour automatique
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('✅ Service Worker enregistré (version 2)');
      registration.update();
    }).catch((error) => {
      console.log('⚠️ Service Worker registration failed:', error);
    });
  });
}
