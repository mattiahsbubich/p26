import { useState } from 'react';
import type {
  Activity,
  ActivityType,
} from '../types';

import {
  createAppleMapsDirectionsUrl,
  createAppleMapsViewUrl,
} from '../utils/maps';

interface ActivitiesPageProps {
  activities: Activity[];
  completedActivityIds: string[];
  onToggleCompleted: (activityId: string) => void;
  onAddActivity: (activity: Activity) => void;
  onRemoveCustomActivity: (activityId: string) => void;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const typeLabels: Record<ActivityType, string> = {
  beach: 'Spiaggia',
  restaurant: 'Ristorante',
  city: 'Città',
  visit: 'Visita',
  walk: 'Passeggiata',
  parking: 'Parcheggio',
  custom: 'Altro',
};

export function ActivitiesPage({
  activities,
  completedActivityIds,
  onToggleCompleted,
  onAddActivity,
  onRemoveCustomActivity,
}: ActivitiesPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] =
    useState<ActivityType>('custom');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function geocodeAddress(
    addressToSearch: string,
  ): Promise<{
    latitude: number;
    longitude: number;
    normalizedAddress: string;
  } | null> {
    const searchParams = new URLSearchParams({
      q: `${addressToSearch}, Puglia, Italia`,
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'it',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        'Il servizio di ricerca degli indirizzi non è disponibile.',
      );
    }

    const results =
      (await response.json()) as GeocodingResult[];

    const result = results[0];

    if (!result) {
      return null;
    }

    return {
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      normalizedAddress: result.display_name,
    };
  }

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
    setFormError('');

    try {
      let coordinates:
        | {
            latitude: number;
            longitude: number;
            normalizedAddress: string;
          }
        | null = null;

      if (trimmedAddress) {
        coordinates = await geocodeAddress(trimmedAddress);

        if (!coordinates) {
          setFormError(
            'Indirizzo non trovato. Prova a inserire anche città e provincia.',
          );

          return;
        }
      }

      onAddActivity({
        id: crypto.randomUUID(),
        name: trimmedName,
        type,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        address:
          coordinates?.normalizedAddress ??
          (trimmedAddress || undefined),
        description:
          description.trim() ||
          'Attività personalizzata.',
        custom: true,
      });

      setName('');
      setType('custom');
      setDescription('');
      setAddress('');
      setFormError('');
      setShowForm(false);
    } catch (error) {
      console.error(error);

      setFormError(
        'Non è stato possibile cercare l’indirizzo. Controlla la connessione oppure lascia il campo vuoto.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete(activity: Activity) {
    const confirmed = window.confirm(
      `Vuoi eliminare "${activity.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    onRemoveCustomActivity(activity.id);
  }

  return (
    <main className="page">
      <header className="page-header activities-header">
        <div>
          <p className="eyebrow">Programma</p>
          <h1>Attività</h1>

          <p className="page-subtitle">
            {completedActivityIds.length} di {activities.length}{' '}
            completate
          </p>
        </div>

        <button
          type="button"
          className="primary-add-button"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError('');
          }}
        >
          {showForm ? 'Chiudi' : '+ Aggiungi'}
        </button>
      </header>

      {showForm && (
        <form
          className="card activity-form"
          onSubmit={handleSubmit}
        >
          <h2>Nuova attività</h2>

          <label>
            Nome
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Es. Cena a Otranto"
              required
            />
          </label>

          <label>
            Tipo
            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as ActivityType,
                )
              }
            >
              {Object.entries(typeLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Indirizzo
            <input
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Facoltativo, es. Piazza del Popolo, Otranto"
            />

            <span className="field-help">
              Inserendolo verrà creato automaticamente un
              pin sulla mappa.
            </span>
          </label>

          <label>
            Descrizione
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Informazioni utili..."
              rows={3}
            />
          </label>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="save-button"
            disabled={isSaving}
          >
            {isSaving
              ? 'Ricerca indirizzo...'
              : 'Salva attività'}
          </button>
        </form>
      )}

      <div className="beach-list">
        {activities.map((activity) => {
          const isCompleted =
            completedActivityIds.includes(activity.id);

          const hasMapPosition =
            typeof activity.latitude === 'number' &&
            typeof activity.longitude === 'number';

          const appleMapsViewUrl =
            createAppleMapsViewUrl(activity);

          const appleMapsDirectionsUrl =
            createAppleMapsDirectionsUrl(activity);

          return (
            <article
              key={activity.id}
              className={`card beach-card ${
                isCompleted ? 'visited' : ''
              }`}
            >
              <div className="beach-card-header">
                <div>
                  <p className="section-label">
                    {typeLabels[activity.type]}
                  </p>

                  <h2>{activity.name}</h2>
                </div>

                <button
                  type="button"
                  className="check-button"
                  onClick={() =>
                    onToggleCompleted(activity.id)
                  }
                  aria-label={
                    isCompleted
                      ? `Segna ${activity.name} come non completata`
                      : `Segna ${activity.name} come completata`
                  }
                >
                  {isCompleted ? '✓' : ''}
                </button>
              </div>

              <p>{activity.description}</p>

              {activity.address && (
                <p className="activity-address">
                  📍 {activity.address}
                </p>
              )}

              {hasMapPosition && (
                <>
                  <span className="map-pin-badge">
                    Visibile sulla mappa
                  </span>

                  <div className="external-map-actions">
                    {appleMapsViewUrl && (
                      <a
                        className="map-action-button secondary"
                        href={appleMapsViewUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span aria-hidden="true">🗺️</span>
                        Vedi in Mappe
                      </a>
                    )}

                    {appleMapsDirectionsUrl && (
                      <a
                        className="map-action-button primary"
                        href={appleMapsDirectionsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span aria-hidden="true">🚗</span>
                        Naviga qui
                      </a>
                    )}
                  </div>
                </>
              )}

              {activity.recommendedWinds && (
                <div className="tag-list">
                  {activity.recommendedWinds.map((wind) => (
                    <span className="tag" key={wind}>
                      {wind}
                    </span>
                  ))}
                </div>
              )}

              {activity.practicalNote && (
                <p className="practical-note">
                  {activity.practicalNote}
                </p>
              )}

              {activity.custom && (
                <button
                  type="button"
                  className="delete-activity-button"
                  onClick={() => handleDelete(activity)}
                >
                  Elimina attività
                </button>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}