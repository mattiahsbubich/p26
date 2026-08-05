import {
  useRef,
  useState,
} from 'react';
import {
  downloadBackup,
  readBackupFile,
  restoreBackup,
} from '../utils/backup';

export function SettingsPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [importError, setImportError] =
    useState('');

  const [isImporting, setIsImporting] =
    useState(false);

  function resetAppData() {
    const confirmed = window.confirm(
      'Vuoi cancellare itinerari, attività, completamenti, pagelle e preferenze?',
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem('p26-selected-wind');
    localStorage.removeItem('p26-visited-beaches');
    localStorage.removeItem('p26-completed-activities');
    localStorage.removeItem('p26-custom-activities');
    localStorage.removeItem('p26-day-plans');
    localStorage.removeItem('p26-activity-reviews');

    window.location.reload();
  }

  function handleExport() {
    try {
      downloadBackup();
    } catch (error) {
      console.error(error);

      window.alert(
        'Non è stato possibile creare il backup.',
      );
    }
  }

  async function handleImport(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportError('');
    setIsImporting(true);

    try {
      const backup = await readBackupFile(file);

      const confirmed = window.confirm(
        'Importando il backup verranno sostituiti i dati attualmente presenti. Vuoi continuare?',
      );

      if (!confirmed) {
        return;
      }

      restoreBackup(backup);

      window.alert(
        'Backup importato correttamente. L’app verrà riavviata.',
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      setImportError(
        error instanceof Error
          ? error.message
          : 'Non è stato possibile importare il backup.',
      );
    } finally {
      setIsImporting(false);

      /*
       * Permette di selezionare nuovamente lo stesso file.
       */
      event.target.value = '';
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">P26</p>
        <h1>Altro</h1>

        <p className="page-subtitle">
          Backup, dati locali e impostazioni
          dell’app.
        </p>
      </header>

      <section className="card settings-card">
        <div className="settings-row">
          <div>
            <h2>Dati salvati sul dispositivo</h2>

            <p>
              Itinerari, vento, attività e pagelle
              vengono conservati localmente.
            </p>
          </div>

          <span aria-hidden="true">💾</span>
        </div>

        <div className="settings-row">
          <div>
            <h2>Funzionamento offline</h2>

            <p>
            Programma, attività e pagelle sono
            disponibili anche senza connessione.
            La cartografia potrebbe richiedere Internet.
            </p>
          </div>

          <span aria-hidden="true">📴</span>
        </div>
      </section>

      <section className="card backup-card">
        <p className="section-label">
          Sicurezza dei dati
        </p>

        <h2>Backup della vacanza</h2>

        <p>
          Esporta un file contenente itinerari,
          attività, completamenti e pagelle.
        </p>

        <div className="backup-actions">
          <button
            type="button"
            className="backup-button"
            onClick={handleExport}
          >
            <span aria-hidden="true">⬇️</span>

            <span>
              <strong>Esporta backup</strong>
              <small>Salva un file JSON</small>
            </span>
          </button>

          <button
            type="button"
            className="backup-button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={isImporting}
          >
            <span aria-hidden="true">⬆️</span>

            <span>
              <strong>
                {isImporting
                  ? 'Importazione...'
                  : 'Importa backup'}
              </strong>

              <small>
                Ripristina i dati salvati
              </small>
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          className="hidden-file-input"
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
        />

        {importError && (
          <p className="form-error" role="alert">
            {importError}
          </p>
        )}
      </section>

      <section className="danger-zone">
        <p className="section-label">
          Zona pericolosa
        </p>

        <button
          type="button"
          className="danger-button"
          onClick={resetAppData}
        >
          Reimposta tutti i dati dell’app
        </button>
      </section>
    </main>
  );
}