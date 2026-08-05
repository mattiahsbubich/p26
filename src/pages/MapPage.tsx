import { useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from 'leaflet';
import type {
  Activity,
  ActivityType,
} from '../types';
import 'leaflet/dist/leaflet.css';

import {
  createAppleMapsDirectionsUrl,
  createAppleMapsViewUrl,
} from '../utils/maps';

interface MapPageProps {
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onRemoveCustomActivity: (activityId: string) => void;
}

interface MapClickHandlerProps {
  enabled: boolean;
  onSelect: (position: LatLng) => void;
}

const markerStyles: Record<
  ActivityType,
  {
    className: string;
    emoji: string;
    label: string;
  }
> = {
  beach: {
    className: 'beach-marker',
    emoji: '🏖️',
    label: 'Spiaggia',
  },

  restaurant: {
    className: 'restaurant-marker',
    emoji: '🍽️',
    label: 'Ristorante',
  },

  city: {
    className: 'city-marker',
    emoji: '🏛️',
    label: 'Città',
  },

  visit: {
    className: 'visit-marker',
    emoji: '🎟️',
    label: 'Visita',
  },

  walk: {
    className: 'walk-marker',
    emoji: '🚶',
    label: 'Passeggiata',
  },

  parking: {
    className: 'parking-marker',
    emoji: '🅿️',
    label: 'Parcheggio',
  },

  custom: {
    className: 'custom-marker',
    emoji: '📍',
    label: 'Altro',
  },
};

function MapClickHandler({
  enabled,
  onSelect,
}: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      if (enabled) {
        onSelect(event.latlng);
      }
    },
  });

  return null;
}

function createActivityIcon(
  activityType: ActivityType,
) {
  const style = markerStyles[activityType];

  return L.divIcon({
    className: 'activity-marker-wrapper',

    html: `
      <div class="activity-map-marker ${style.className}">
        <span>${style.emoji}</span>
      </div>
    `,

    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
  });
}

export function MapPage({
  activities,
  onAddActivity,
  onRemoveCustomActivity,
}: MapPageProps) {
  const [addingPin, setAddingPin] = useState(false);

  const [selectedPosition, setSelectedPosition] =
    useState<LatLng | null>(null);

  const [pinName, setPinName] = useState('');

  const mapActivities = useMemo(
    () =>
      activities.filter(
        (
          activity,
        ): activity is Activity & {
          latitude: number;
          longitude: number;
        } =>
          typeof activity.latitude === 'number' &&
          typeof activity.longitude === 'number',
      ),
    [activities],
  );

  function handleSavePin() {
    const trimmedName = pinName.trim();

    if (!selectedPosition || !trimmedName) {
      return;
    }

    onAddActivity({
      id: crypto.randomUUID(),
      name: trimmedName,
      type: 'custom',
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
      description:
        'Pin aggiunto manualmente dalla mappa.',
      custom: true,
    });

    setPinName('');
    setSelectedPosition(null);
    setAddingPin(false);
  }

  function handleRemovePin(activity: Activity) {
    if (!activity.custom) {
      return;
    }

    const confirmed = window.confirm(
      `Vuoi rimuovere "${activity.name}"?`,
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
          <p className="eyebrow">Salento</p>
          <h1>Mappa</h1>

          <p className="page-subtitle">
            {mapActivities.length} luoghi presenti sulla
            mappa.
          </p>
        </div>

        <button
          type="button"
          className="primary-add-button"
          onClick={() => {
            setAddingPin((current) => !current);
            setSelectedPosition(null);
            setPinName('');
          }}
        >
          {addingPin ? 'Annulla' : '+ Pin'}
        </button>
      </header>

      <section className="map-legend">
        {Object.entries(markerStyles).map(
          ([type, style]) => (
            <span
              className={`map-legend-item ${style.className}`}
              key={type}
            >
              {style.emoji} {style.label}
            </span>
          ),
        )}
      </section>

      {addingPin && (
        <section className="card map-instructions">
          <h2>Aggiungi un pin</h2>

          <p>
            Tocca un punto sulla mappa e assegna un nome al
            luogo.
          </p>

          {selectedPosition && (
            <>
              <input
                value={pinName}
                onChange={(event) =>
                  setPinName(event.target.value)
                }
                placeholder="Nome del luogo"
              />

              <button
                type="button"
                className="save-button"
                onClick={handleSavePin}
                disabled={!pinName.trim()}
              >
                Salva pin
              </button>
            </>
          )}
        </section>
      )}

      <section className="map-card">
        <MapContainer
          center={[40.119, 18.298]}
          zoom={9}
          className="leaflet-map"
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            enabled={addingPin}
            onSelect={setSelectedPosition}
          />

          {mapActivities.map((activity) => {
            const markerStyle =
              markerStyles[activity.type];

            const appleMapsViewUrl =
                createAppleMapsViewUrl(activity);

            const appleMapsDirectionsUrl =
                createAppleMapsDirectionsUrl(activity);

            return (
              <Marker
                key={activity.id}
                position={[
                  activity.latitude,
                  activity.longitude,
                ]}
                icon={createActivityIcon(activity.type)}
                title={activity.name}
              >
                <Popup>
                  <div className="map-popup">
                    <p className="map-popup-type">
                      {markerStyle.emoji}{' '}
                      {markerStyle.label}
                    </p>

                    <strong>{activity.name}</strong>

                    <p>{activity.description}</p>

                    {activity.address && (
                      <p className="map-popup-address">
                        {activity.address}
                      </p>
                    )}

                    <div className="map-popup-actions">
                    {appleMapsViewUrl && (
                        <a
                        href={appleMapsViewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="map-popup-button secondary"
                        >
                        Vedi in Mappe
                        </a>
                    )}

                    {appleMapsDirectionsUrl && (
                        <a
                        href={appleMapsDirectionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="map-popup-button primary"
                        >
                        Naviga
                        </a>
                    )}
                    </div>

                    {activity.custom && (
                      <button
                        type="button"
                        className="remove-pin-button"
                        onClick={() =>
                          handleRemovePin(activity)
                        }
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {selectedPosition && (
            <Marker
              position={selectedPosition}
              icon={createActivityIcon('custom')}
            >
              <Popup>Nuovo pin</Popup>
            </Marker>
          )}
        </MapContainer>
      </section>
    </main>
  );
}