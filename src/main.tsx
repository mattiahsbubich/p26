import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/source-sans-3';
import App from './App.tsx';
import './index.css';

registerSW({
  immediate: true,

  onNeedRefresh() {
    /*
     * Il service worker si aggiorna automaticamente:
     * ricarichiamo per usare subito la versione nuova.
     */
    window.location.reload();
  },

  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('paris26-offline-ready'));
  },

  onRegisterError(error) {
    console.error('Errore durante la registrazione della PWA:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
