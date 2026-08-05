import { useEffect, useState } from 'react';

type ConnectionStatus =
  | 'online'
  | 'offline'
  | 'ready';

export function OfflineStatus() {
  const [status, setStatus] =
    useState<ConnectionStatus>(() =>
      navigator.onLine ? 'online' : 'offline',
    );

  const [visible, setVisible] = useState(
    !navigator.onLine,
  );

  useEffect(() => {
    let hideTimeout: number | undefined;

    function showTemporaryStatus(
      nextStatus: ConnectionStatus,
    ) {
      setStatus(nextStatus);
      setVisible(true);

      window.clearTimeout(hideTimeout);

      hideTimeout = window.setTimeout(() => {
        setVisible(false);
      }, 3500);
    }

    function handleOnline() {
      showTemporaryStatus('online');
    }

    function handleOffline() {
      setStatus('offline');
      setVisible(true);
    }

    function handleOfflineReady() {
      showTemporaryStatus('ready');
    }

    window.addEventListener(
      'online',
      handleOnline,
    );

    window.addEventListener(
      'offline',
      handleOffline,
    );

    window.addEventListener(
      'p26-offline-ready',
      handleOfflineReady,
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline,
      );

      window.removeEventListener(
        'offline',
        handleOffline,
      );

      window.removeEventListener(
        'p26-offline-ready',
        handleOfflineReady,
      );

      window.clearTimeout(hideTimeout);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const content = {
    online: {
      icon: '🌐',
      label: 'Connessione ripristinata',
    },

    offline: {
      icon: '📴',
      label: 'Modalità offline',
    },

    ready: {
      icon: '✅',
      label: 'App pronta per l’uso offline',
    },
  }[status];

  return (
    <div
      className={`offline-status ${status}`}
      role="status"
    >
      <span aria-hidden="true">
        {content.icon}
      </span>

      <span>{content.label}</span>
    </div>
  );
}