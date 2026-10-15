import { useEffect, useState } from 'react';

type ConnectionStatus = 'online' | 'offline' | 'ready';

const content: Record<ConnectionStatus, string> = {
  online: 'Connessione ripristinata',
  offline: 'Modalità offline',
  ready: 'App pronta per l’uso offline',
};

export function OfflineStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    navigator.onLine ? 'online' : 'offline',
  );

  const [visible, setVisible] = useState(!navigator.onLine);

  useEffect(() => {
    let hideTimeout: number | undefined;

    function showTemporary(next: ConnectionStatus) {
      setStatus(next);
      setVisible(true);

      window.clearTimeout(hideTimeout);

      hideTimeout = window.setTimeout(() => {
        setVisible(false);
      }, 3500);
    }

    const handleOnline = () => showTemporary('online');
    const handleReady = () => showTemporary('ready');

    function handleOffline() {
      setStatus('offline');
      setVisible(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('paris26-offline-ready', handleReady);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('paris26-offline-ready', handleReady);
      window.clearTimeout(hideTimeout);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={`offline-status ${status}`} role="status">
      {content[status]}
    </div>
  );
}
