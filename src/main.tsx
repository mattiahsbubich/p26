import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({
  immediate: true,

  onNeedRefresh() {
    /*
     * Il service worker si aggiorna automaticamente.
     * Per ora ricarichiamo direttamente l'app.
     */
    window.location.reload();
  },

  onOfflineReady() {
    console.info(
      'P26 è pronta per funzionare offline.',
    );

    window.dispatchEvent(
      new CustomEvent('p26-offline-ready'),
    );
  },

  onRegisteredSW(_swUrl, registration) {
    console.info(
      'Service worker registrato:',
      registration,
    );
  },

  onRegisterError(error) {
    console.error(
      'Errore durante la registrazione della PWA:',
      error,
    );
  },
});

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <App />
  </StrictMode>,
);