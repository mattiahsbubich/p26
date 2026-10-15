import { useState } from 'react';
import {
  activityTypeLabels,
  activityTypeOrder,
} from '../data/activityTypes';
import type { Activity, ActivityType } from '../types';
import { geocodeAddress } from '../utils/geocode';
import { createId } from '../utils/id';

export interface PlaceExtras {
  time?: string;
  note?: string;
}

interface PlaceFormProps {
  /* Mostra anche orario e nota, per aggiungere il luogo a un giorno. */
  withSchedule?: boolean;
  submitLabel: string;
  onSubmit: (activity: Activity, extras: PlaceExtras) => void;
}

export function PlaceForm({
  withSchedule = false,
  submitLabel,
  onSubmit,
}: PlaceFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ActivityType>('custom');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const position = trimmedAddress
        ? await geocodeAddress(trimmedAddress)
        : null;

      if (trimmedAddress && !position) {
        setError(
          'Indirizzo non trovato. Prova ad aggiungere via, numero e città.',
        );

        return;
      }

      onSubmit(
        {
          id: createId(),
          name: trimmedName,
          type,
          latitude: position?.latitude,
          longitude: position?.longitude,
          address: position?.displayName ?? (trimmedAddress || undefined),
          description: description.trim() || 'Luogo aggiunto da voi.',
          custom: true,
        },
        {
          time: time.trim() || undefined,
          note: note.trim() || undefined,
        },
      );
    } catch (caught) {
      console.error(caught);

      setError(
        'Non è stato possibile cercare l’indirizzo. Controlla la connessione oppure lascia il campo vuoto.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Es. Bouillon Chartier"
          required
        />
      </label>

      <label>
        Tipo
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as ActivityType)
          }
        >
          {activityTypeOrder.map((value) => (
            <option key={value} value={value}>
              {activityTypeLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Indirizzo
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Facoltativo, es. 7 Rue du Faubourg Montmartre"
          autoCapitalize="off"
        />
        <span className="field-help">
          Se lo inserisci, il luogo compare sulla mappa e puoi
          navigare fin lì.
        </span>
      </label>

      <label>
        Descrizione
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Informazioni utili..."
          rows={2}
        />
      </label>

      {withSchedule && (
        <>
          <label>
            Orario
            <input
              value={time}
              onChange={(event) => setTime(event.target.value)}
              placeholder="Facoltativo, es. 15:00"
            />
          </label>

          <label>
            Nota per questa tappa
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
          </label>
        </>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="button primary block"
        disabled={isSaving || !name.trim()}
      >
        {isSaving ? 'Ricerca indirizzo...' : submitLabel}
      </button>
    </form>
  );
}
