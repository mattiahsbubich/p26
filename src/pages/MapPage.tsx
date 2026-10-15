import { useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapRef,
} from 'react-map-gl/maplibre';
import { setWorkerUrl, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DirectionsLinks } from '../components/DirectionsLinks';
import { TypeIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { activityTypeLabels } from '../data/activityTypes';
import { tripDays } from '../data/trip';
import type { Activity, DayPlan } from '../types';
import { createId } from '../utils/id';
import { hasCoordinates } from '../utils/maps';
import { fallbackStyle, loadParisStyle } from '../utils/mapStyle';

/* Il worker è copiato in <base>/maplibre/ da vite.config.ts. */
setWorkerUrl(
  `${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`,
);

export type MapFilter = 'all' | 'unplanned' | string;

interface MapPageProps {
  activities: Activity[];
  dayPlans: DayPlan[];
  filter: MapFilter;
  onFilterChange: (filter: MapFilter) => void;
  onAddActivity: (activity: Activity) => void;
  onAddToDay: (date: string, activityId: string) => void;
  onRemoveCustomActivity: (activityId: string) => void;
}

interface MapPoint {
  key: string;
  activity: Activity & { latitude: number; longitude: number };
  number?: number;
  time?: string;
  note?: string;
  color: string;
  ink: string;
}

const PARIS_CENTER = { longitude: 2.3522, latitude: 48.8566 };
const NEUTRAL_COLOR = '#5a6376';

function pinStyle(color: string, ink: string): React.CSSProperties {
  return { '--line': color, '--line-ink': ink } as React.CSSProperties;
}

/*
 * Inquadra le tappe. Aeroporto e alloggio non devono "allontanare"
 * l'inquadratura (CDG è a 25 km dal centro); nella vista generale
 * ci limitiamo a Parigi, escludendo Versailles.
 */
function boundsFor(points: MapPoint[], restrictToParis: boolean) {
  const core = points.filter(
    (point) => point.activity.type !== 'logistics',
  );

  let coordinates = (core.length >= 2 ? core : points).map(
    (point) =>
      [point.activity.longitude, point.activity.latitude] as [
        number,
        number,
      ],
  );

  if (restrictToParis) {
    const central = coordinates.filter(
      ([lng, lat]) =>
        Math.abs(lat - PARIS_CENTER.latitude) < 0.08 &&
        Math.abs(lng - PARIS_CENTER.longitude) < 0.12,
    );

    if (central.length > 0) {
      coordinates = central;
    }
  }

  return coordinates;
}

export function MapPage({
  activities,
  dayPlans,
  filter,
  onFilterChange,
  onAddActivity,
  onAddToDay,
  onRemoveCustomActivity,
}: MapPageProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapStyle, setMapStyle] = useState<StyleSpecification | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const [pitched, setPitched] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [addingPin, setAddingPin] = useState(false);
  const [pinPosition, setPinPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pinName, setPinName] = useState('');
  const [pinDate, setPinDate] = useState('');

  const activeDay = tripDays.find((day) => day.date === filter);

  useEffect(() => {
    let cancelled = false;

    loadParisStyle()
      .then((style) => {
        if (!cancelled) {
          setMapStyle(style);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMapStyle(fallbackStyle);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const points = useMemo<MapPoint[]>(() => {
    const byId = new globalThis.Map(
      activities.map((item) => [item.id, item]),
    );

    const plannedDay = (activityId: string) =>
      tripDays.find((day) =>
        dayPlans
          .find((plan) => plan.date === day.date)
          ?.items.some((item) => item.activityId === activityId),
      );

    if (activeDay) {
      const plan = dayPlans.find(
        (item) => item.date === activeDay.date,
      );

      const result: MapPoint[] = [];

      for (const item of plan?.items ?? []) {
        const activity = item.activityId
          ? byId.get(item.activityId)
          : undefined;

        if (activity && hasCoordinates(activity)) {
          result.push({
            key: `${activeDay.date}-${item.id}`,
            activity,
            number: result.length + 1,
            time: item.time,
            note: item.note,
            color: activeDay.lineColor,
            ink: activeDay.lineInk,
          });
        }
      }

      return result;
    }

    return activities.filter(hasCoordinates).flatMap((activity) => {
      const day = plannedDay(activity.id);

      if (filter === 'unplanned' && day) {
        return [];
      }

      return [
        {
          key: activity.id,
          activity,
          color: day?.lineColor ?? NEUTRAL_COLOR,
          ink: day?.lineInk ?? '#ffffff',
        },
      ];
    });
  }, [activities, dayPlans, activeDay, filter]);

  const route = useMemo(
    () =>
      activeDay && points.length > 1
        ? {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: points.map((point) => [
                point.activity.longitude,
                point.activity.latitude,
              ]),
            },
          }
        : null,
    [activeDay, points],
  );

  const selectedPoint = points.find((point) => point.key === selectedKey);

  /* Ad ogni cambio di filtro, inquadra le tappe del giorno. */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !loaded) {
      return;
    }

    setSelectedKey(null);

    const coordinates = boundsFor(points, !activeDay);

    if (coordinates.length === 0) {
      map.easeTo({ center: [PARIS_CENTER.longitude, PARIS_CENTER.latitude], zoom: 12 });
    } else if (coordinates.length === 1) {
      map.easeTo({ center: coordinates[0], zoom: 15 });
    } else {
      const lngs = coordinates.map(([lng]) => lng);
      const lats = coordinates.map(([, lat]) => lat);

      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        {
          padding: { top: 60, bottom: 60, left: 44, right: 44 },
          maxZoom: 16,
          duration: 700,
        },
      );
    }
    // Ricalcoliamo solo quando cambia il filtro, non a ogni render.
  }, [filter, loaded]);

  /*
   * Centra la tappa un po' più in basso del centro: così il fumetto
   * con i dettagli ha spazio sopra e non esce dalla mappa.
   */
  function focusPoint(point: MapPoint, zoom?: number) {
    const map = mapRef.current;

    map?.easeTo({
      center: [point.activity.longitude, point.activity.latitude],
      zoom: Math.max(zoom ?? 0, map.getZoom()),
      offset: [0, 90],
      duration: 600,
    });

    setSelectedKey(point.key);
  }

  function togglePitch() {
    const next = !pitched;

    setPitched(next);

    mapRef.current?.easeTo({
      pitch: next ? 58 : 0,
      bearing: next ? -18 : 0,
      duration: 700,
    });
  }

  function resetPinForm() {
    setAddingPin(false);
    setPinPosition(null);
    setPinName('');
    setPinDate('');
  }

  function handleSavePin() {
    const name = pinName.trim();

    if (!pinPosition || !name) {
      return;
    }

    const id = createId();

    onAddActivity({
      id,
      name,
      type: 'custom',
      latitude: pinPosition.lat,
      longitude: pinPosition.lng,
      description: 'Pin aggiunto dalla mappa.',
      custom: true,
    });

    if (pinDate) {
      onAddToDay(pinDate, id);
    }

    resetPinForm();
  }

  const filters: Array<{ id: MapFilter; label: string }> = [
    { id: 'all', label: 'Tutti' },
    ...tripDays.map((day) => ({
      id: day.date,
      label: day.shortDay,
    })),
    { id: 'unplanned', label: 'Altri' },
  ];

  return (
    <main className="page">
      <PageHeader
        eyebrow="Parigi"
        title="Mappa"
        subtitle={`${points.length} ${
          points.length === 1 ? 'luogo' : 'luoghi'
        } sulla mappa`}
        action={
          <button
            type="button"
            className={`button small ${
              addingPin ? 'outline' : 'primary'
            }`}
            onClick={() => {
              if (addingPin) {
                resetPinForm();
              } else {
                setAddingPin(true);
              }
            }}
          >
            {addingPin ? 'Annulla' : '+ Pin'}
          </button>
        }
      />

      <div className="filter-bar" role="tablist">
        {filters.map((item) => {
          const day = tripDays.find((d) => d.date === item.id);

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`filter-chip ${
                filter === item.id ? 'selected' : ''
              }`}
              style={day ? pinStyle(day.lineColor, day.lineInk) : undefined}
              onClick={() => onFilterChange(item.id)}
            >
              {day && (
                <span className="roundel mini">{day.dayNumber}</span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      {addingPin && (
        <section className="panel">
          <h2>Aggiungi un pin</h2>

          <p className="muted">
            Tocca un punto sulla mappa, poi dai un nome al luogo.
          </p>

          {pinPosition && (
            <div className="stack-form">
              <input
                value={pinName}
                onChange={(event) => setPinName(event.target.value)}
                placeholder="Nome del luogo"
                aria-label="Nome del luogo"
              />

              <select
                value={pinDate}
                onChange={(event) => setPinDate(event.target.value)}
                aria-label="Aggiungi a un giorno"
              >
                <option value="">Non aggiungere al programma</option>

                {tripDays.map((day) => (
                  <option key={day.date} value={day.date}>
                    Aggiungi a {day.fullLabel}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="button primary block"
                onClick={handleSavePin}
                disabled={!pinName.trim()}
              >
                Salva pin
              </button>
            </div>
          )}
        </section>
      )}

      <section className="map-card">
        {mapStyle ? (
          <Map
            ref={mapRef}
            mapStyle={mapStyle}
            initialViewState={{ ...PARIS_CENTER, zoom: 12 }}
            minZoom={9}
            maxZoom={19}
            maxPitch={65}
            attributionControl={false}
            cursor={addingPin ? 'crosshair' : undefined}
            style={{ width: '100%', height: '100%' }}
            onLoad={() => setLoaded(true)}
            onClick={(event) => {
              if (addingPin) {
                setPinPosition({
                  lat: event.lngLat.lat,
                  lng: event.lngLat.lng,
                });
              } else {
                setSelectedKey(null);
              }
            }}
          >
            <NavigationControl position="top-left" visualizePitch />

            <GeolocateControl
              position="top-left"
              positionOptions={{ enableHighAccuracy: true }}
              fitBoundsOptions={{ maxZoom: 16 }}
              showAccuracyCircle={false}
            />

            <AttributionControl compact />

            {route && activeDay && (
              <Source id="route" type="geojson" data={route}>
                <Layer
                  id="route-casing"
                  type="line"
                  layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                  paint={{
                    'line-color': '#fffaf0',
                    'line-width': 9,
                    'line-opacity': 0.95,
                  }}
                />

                <Layer
                  id="route-line"
                  type="line"
                  layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                  paint={{
                    'line-color': activeDay.lineColor,
                    'line-width': 5,
                    'line-dasharray': [1, 1.6],
                  }}
                />
              </Source>
            )}

            {points.map((point) => (
              <Marker
                key={point.key}
                longitude={point.activity.longitude}
                latitude={point.activity.latitude}
                anchor="center"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  focusPoint(point);
                }}
              >
                <div
                  className={`map-pin-wrap ${
                    selectedKey === point.key ? 'selected' : ''
                  }`}
                  style={pinStyle(point.color, point.ink)}
                  title={point.activity.name}
                >
                  <div className="map-pin">
                    {point.number !== undefined ? (
                      point.number
                    ) : (
                      <TypeIcon type={point.activity.type} size={16} />
                    )}
                  </div>

                  {point.number !== undefined && (
                    <span className="map-pin-label">
                      {point.activity.name}
                    </span>
                  )}
                </div>
              </Marker>
            ))}

            {selectedPoint && (
              <Popup
                longitude={selectedPoint.activity.longitude}
                latitude={selectedPoint.activity.latitude}
                offset={26}
                maxWidth="250px"
                focusAfterOpen={false}
                onClose={() => setSelectedKey(null)}
              >
                <div className="map-popup">
                  <p className="section-label">
                    {selectedPoint.time ? `${selectedPoint.time} · ` : ''}
                    {activityTypeLabels[selectedPoint.activity.type]}
                  </p>

                  <strong>{selectedPoint.activity.name}</strong>

                  <p>
                    {selectedPoint.note ??
                      selectedPoint.activity.description}
                  </p>

                  <DirectionsLinks activity={selectedPoint.activity} />

                  {selectedPoint.activity.custom && (
                    <button
                      type="button"
                      className="link-button danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Rimuovere “${selectedPoint.activity.name}”?`,
                          )
                        ) {
                          setSelectedKey(null);
                          onRemoveCustomActivity(
                            selectedPoint.activity.id,
                          );
                        }
                      }}
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              </Popup>
            )}

            {pinPosition && (
              <Marker
                longitude={pinPosition.lng}
                latitude={pinPosition.lat}
                anchor="center"
              >
                <div
                  className="map-pin-wrap"
                  style={pinStyle('#8a3a4c', '#ffffff')}
                >
                  <div className="map-pin">
                    <TypeIcon type="custom" size={16} />
                  </div>
                </div>
              </Marker>
            )}
          </Map>
        ) : (
          <div className="map-loading">Carico la mappa di Parigi…</div>
        )}

        <button
          type="button"
          className={`pitch-button ${pitched ? 'active' : ''}`}
          onClick={togglePitch}
          aria-pressed={pitched}
          aria-label="Vista inclinata 3D"
        >
          3D
        </button>
      </section>

      {activeDay && points.length > 0 && (
        <section className="map-steps">
          <h2 className="rule-heading">Tappe sulla mappa</h2>

          <ol>
            {points.map((point) => (
              <li key={point.key}>
                <button type="button" onClick={() => focusPoint(point, 15)}>
                  <span
                    className="roundel mini"
                    style={pinStyle(point.color, point.ink)}
                  >
                    {point.number}
                  </span>

                  <span>{point.activity.name}</span>

                  {point.time && <small>{point.time}</small>}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
