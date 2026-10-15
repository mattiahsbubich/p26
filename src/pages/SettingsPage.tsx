import { useRef, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { CheckIcon } from '../components/Icons';
import {
  bookingPriority,
  infoCards,
  packingList,
  tripDays,
} from '../data/trip';
import {
  parseStringArray,
  usePersistentState,
} from '../hooks/usePersistentState';
import type { Activity, DayPlan } from '../types';
import {
  downloadBackup,
  readBackupFile,
  restoreBackup,
} from '../utils/backup';
import { getMapsProvider, type MapsProvider } from '../utils/maps';
import {
  ALL_STORAGE_KEYS,
  STORAGE_KEYS,
  writeStored,
} from '../utils/storage';

interface SettingsPageProps {
  activities: Activity[];
  dayPlans: DayPlan[];
  bookedActivityIds: string[];
  onToggleBooked: (activityId: string) => void;
}

export function SettingsPage({
  activities,
  dayPlans,
  bookedActivityIds,
  onToggleBooked,
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [provider, setProvider] = useState<MapsProvider>(getMapsProvider);

  const [packed, setPacked] = usePersistentState<string[]>(
    STORAGE_KEYS.packing,
    () => [],
    parseStringArray,
  );

  const bookings = bookingPriority.flatMap((id) => {
    const activity = activities.find((item) => item.id === id);

    if (!activity) {
      return [];
    }

    const date = dayPlans.find((plan) =>
      plan.items.some((item) => item.activityId === id),
    )?.date;

    return [
      {
        activity,
        day: tripDays.find((item) => item.date === date),
      },
    ];
  });

  function changeProvider(next: MapsProvider) {
    setProvider(next);
    writeStored(STORAGE_KEYS.mapsProvider, next);
  }

  function togglePacked(id: string) {
    setPacked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function resetAppData() {
    if (
      !window.confirm(
        'Vuoi cancellare itinerari modificati, luoghi aggiunti, spunte, pagelle e preferenze?',
      )
    ) {
      return;
    }

    for (const key of ALL_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    window.location.reload();
  }

  function handleExport() {
    try {
      downloadBackup();
    } catch (error) {
      console.error(error);
      window.alert('Non è stato possibile creare il backup.');
    }
  }

  async function handleImport(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setImportError('');
    setIsImporting(true);

    try {
      const backup = await readBackupFile(file);

      if (
        !window.confirm(
          'Importando il backup verranno sostituiti i dati attualmente presenti. Vuoi continuare?',
        )
      ) {
        return;
      }

      restoreBackup(backup);

      window.alert('Backup importato correttamente. L’app verrà riavviata.');
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
      input.value = '';
    }
  }

  return (
    <main className="page">
      <PageHeader
        eyebrow="Parigi 2026"
        title="Altro"
        subtitle="Prima di partire, backup e impostazioni."
      />

      <section className="panel">
        <p className="section-label">Prima di partire</p>
        <h2>Prenotazioni</h2>

        <p className="muted">
          {bookings.filter(({ activity }) =>
            bookedActivityIds.includes(activity.id),
          ).length}{' '}
          di {bookings.length} prenotate
        </p>

        <ul className="checklist">
          {bookings.map(({ activity, day }) => {
            const booked = bookedActivityIds.includes(activity.id);

            return (
              <li key={activity.id}>
                <button
                  type="button"
                  className={`checklist-item ${booked ? 'checked' : ''}`}
                  onClick={() => onToggleBooked(activity.id)}
                  aria-pressed={booked}
                >
                  <span className="checkbox">
                    {booked && <CheckIcon size={14} />}
                  </span>

                  <span>
                    <strong>{activity.name}</strong>

                    <small>
                      {day ? day.fullLabel : 'Non in programma'}
                      {activity.booking === 'check' && ' · verificare slot'}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <h2>Da avere sempre con voi</h2>

        <ul className="checklist">
          {packingList.map((item) => {
            const checked = packed.includes(item.id);

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`checklist-item ${checked ? 'checked' : ''}`}
                  onClick={() => togglePacked(item.id)}
                  aria-pressed={checked}
                >
                  <span className="checkbox">
                    {checked && <CheckIcon size={14} />}
                  </span>

                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {infoCards.map((card) => (
        <aside className="callout info" key={card.title}>
          <h3>{card.title}</h3>
          <p>{card.text}</p>
        </aside>
      ))}

      <section className="panel">
        <p className="section-label">Navigazione</p>
        <h2>App mappe preferita</h2>

        <p className="muted">
          I pulsanti “Mezzi” e “A piedi” aprono questa app.
        </p>

        <div className="segmented">
          <button
            type="button"
            className={provider === 'apple' ? 'selected' : ''}
            onClick={() => changeProvider('apple')}
          >
            Apple Mappe
          </button>

          <button
            type="button"
            className={provider === 'google' ? 'selected' : ''}
            onClick={() => changeProvider('google')}
          >
            Google Maps
          </button>
        </div>
      </section>

      <section className="panel">
        <p className="section-label">Sicurezza dei dati</p>
        <h2>Backup del viaggio</h2>

        <p className="muted">
          Tutto è salvato sul tuo telefono. Esporta un file con
          itinerario, luoghi, spunte e pagelle: puoi anche
          mandarlo all’altro telefono e importarlo lì.
        </p>

        <div className="backup-actions">
          <button
            type="button"
            className="button outline"
            onClick={handleExport}
          >
            Esporta backup
          </button>

          <button
            type="button"
            className="button outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? 'Importazione...' : 'Importa backup'}
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

        <p className="muted small-print">
          Offline: programma, luoghi e pagelle funzionano anche senza
          connessione. La mappa mostra solo le zone già viste.
        </p>
      </section>

      <section className="danger-zone">
        <p className="section-label">Zona pericolosa</p>

        <button
          type="button"
          className="button danger-solid block"
          onClick={resetAppData}
        >
          Reimposta tutti i dati dell’app
        </button>
      </section>
    </main>
  );
}
