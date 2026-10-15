import { useState } from 'react';
import type { Activity } from '../types';
import { geocodeAddress } from '../utils/geocode';
import { Sheet } from './Sheet';

interface EditPlaceSheetProps {
  activity: Activity;
  onSave: (
    patch: Pick<
      Activity,
      'name' | 'address' | 'latitude' | 'longitude'
    >,
  ) => void;
  onClose: () => void;
}

export function EditPlaceSheet({
  activity,
  onSave,
  onClose,
}: EditPlaceSheetProps) {
  const [name, setName] = useState(activity.name);
  const [address, setAddress] = useState(activity.address ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (!trimmedAddress) {
        onSave({
          name: trimmedName,
          address: undefined,
          latitude: undefined,
          longitude: undefined,
        });
      } else if (trimmedAddress === (activity.address ?? '')) {
        onSave({
          name: trimmedName,
          address: activity.address,
          latitude: activity.latitude,
          longitude: activity.longitude,
        });
      } else {
        const position = await geocodeAddress(trimmedAddress);

        if (!position) {
          setError(
            'Indirizzo non trovato. Prova ad aggiungere via, numero e città.',
          );

          return;
        }

        onSave({
          name: trimmedName,
          address: trimmedAddress,
          latitude: position.latitude,
          longitude: position.longitude,
        });
      }

      onClose();
    } catch (caught) {
      console.error(caught);

      setError(
        'Non è stato possibile cercare l’indirizzo. Controlla la connessione.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      title="Cambia nome / indirizzo"
      eyebrow={activity.name}
      onClose={onClose}
    >
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Indirizzo
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Es. 15 Rue Marbeuf, 75008 Paris"
            autoCapitalize="off"
          />
          <span className="field-help">
            Con un indirizzo il luogo compare sulla mappa e funzionano
            “Mezzi” e “A piedi”. Lascia vuoto per toglierlo dalla mappa.
          </span>
        </label>

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
          {isSaving ? 'Ricerca indirizzo...' : 'Salva'}
        </button>
      </form>
    </Sheet>
  );
}
