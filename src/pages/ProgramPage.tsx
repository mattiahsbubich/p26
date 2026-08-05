import { useMemo, useState } from 'react';
import { itineraries } from '../data/itineraries';
import type {
  Activity,
  DayPlan,
  Itinerary,
  Wind,
} from '../types';

import {
  createAppleMapsDirectionsUrl,
} from '../utils/maps';


interface ProgramPageProps {
  activities: Activity[];
  completedActivityIds: string[];
  dayPlans: DayPlan[];
  onUpdateWind: (date: string, wind: Wind) => void;
  onAddActivity: (date: string, activityId: string) => void;
  onRemoveActivity: (date: string, activityId: string) => void;
  onMoveActivity: (
    date: string,
    activityId: string,
    direction: 'up' | 'down',
  ) => void;
  onCopySuggested: (
    date: string,
    activityIds: string[],
  ) => void;
}

interface TripDay {
  date: string;
  shortDay: string;
  dayNumber: string;
  fullLabel: string;
  lockedItineraryId?: string;
}

const tripDays: TripDay[] = [
  {
    date: '2026-08-09',
    shortDay: 'Dom',
    dayNumber: '9',
    fullLabel: 'Domenica 9 agosto',
    lockedItineraryId: 'arrival-adriatic',
  },
  {
    date: '2026-08-10',
    shortDay: 'Lun',
    dayNumber: '10',
    fullLabel: 'Lunedì 10 agosto',
  },
  {
    date: '2026-08-11',
    shortDay: 'Mar',
    dayNumber: '11',
    fullLabel: 'Martedì 11 agosto',
  },
  {
    date: '2026-08-12',
    shortDay: 'Mer',
    dayNumber: '12',
    fullLabel: 'Mercoledì 12 agosto',
  },
  {
    date: '2026-08-13',
    shortDay: 'Gio',
    dayNumber: '13',
    fullLabel: 'Giovedì 13 agosto',
  },
];

const windOptions: Array<{
  value: Wind;
  label: string;
}> = [
  { value: 'tramontana', label: 'Tramontana' },
  { value: 'maestrale', label: 'Maestrale' },
  { value: 'grecale', label: 'Grecale' },
  { value: 'scirocco', label: 'Scirocco' },
  { value: 'ostro', label: 'Ostro' },
  { value: 'variabile', label: 'Variabile' },
];

function getRemainingActivityIds(
  itinerary: Itinerary,
  completedActivityIds: string[],
) {
  return itinerary.activityIds.filter(
    (activityId) => !completedActivityIds.includes(activityId),
  );
}

export function ProgramPage({
  activities,
  completedActivityIds,
  dayPlans,
  onUpdateWind,
  onAddActivity,
  onRemoveActivity,
  onMoveActivity,
  onCopySuggested,
}: ProgramPageProps) {
  const [selectedDate, setSelectedDate] =
    useState<string>('2026-08-09');

  const [activityToAdd, setActivityToAdd] = useState('');

  const selectedTripDay =
    tripDays.find((day) => day.date === selectedDate) ??
    tripDays[0];

  const selectedPlan =
    dayPlans.find((plan) => plan.date === selectedDate) ??
    dayPlans[0];

  const suggestedItinerary = useMemo(() => {
    if (!selectedPlan) {
      return undefined;
    }

    if (selectedTripDay.lockedItineraryId) {
      const lockedItinerary = itineraries.find(
        (itinerary) =>
          itinerary.id === selectedTripDay.lockedItineraryId,
      );

      if (
        lockedItinerary &&
        getRemainingActivityIds(
          lockedItinerary,
          completedActivityIds,
        ).length > 0
      ) {
        return lockedItinerary;
      }
    }

    return itineraries
      .filter((itinerary) =>
        itinerary.recommendedWinds.includes(
          selectedPlan.selectedWind,
        ),
      )
      .filter(
        (itinerary) =>
          getRemainingActivityIds(
            itinerary,
            completedActivityIds,
          ).length > 0,
      )
      .sort((first, second) => {
        const firstRemaining = getRemainingActivityIds(
          first,
          completedActivityIds,
        ).length;

        const secondRemaining = getRemainingActivityIds(
          second,
          completedActivityIds,
        ).length;

        return secondRemaining - firstRemaining;
      })[0];
  }, [
    selectedPlan,
    selectedTripDay.lockedItineraryId,
    completedActivityIds,
  ]);

  const suggestedActivities = useMemo(() => {
    if (!suggestedItinerary) {
      return [];
    }

    return getRemainingActivityIds(
      suggestedItinerary,
      completedActivityIds,
    )
      .map((activityId) =>
        activities.find((activity) => activity.id === activityId),
      )
      .filter(
        (activity): activity is Activity =>
          activity !== undefined,
      );
  }, [
    suggestedItinerary,
    completedActivityIds,
    activities,
  ]);

  const customItineraryActivities = useMemo(() => {
    if (!selectedPlan) {
      return [];
    }

    return selectedPlan.activityIds
      .map((activityId) =>
        activities.find((activity) => activity.id === activityId),
      )
      .filter(
        (activity): activity is Activity =>
          activity !== undefined,
      );
  }, [selectedPlan, activities]);

  const availableActivities = useMemo(() => {
    if (!selectedPlan) {
      return [];
    }

    return activities.filter(
      (activity) =>
        !selectedPlan.activityIds.includes(activity.id) &&
        !completedActivityIds.includes(activity.id),
    );
  }, [activities, selectedPlan, completedActivityIds]);

  if (!selectedPlan) {
    return null;
  }

  function handleAddActivity() {
    if (!activityToAdd) {
      return;
    }

    onAddActivity(selectedDate, activityToAdd);
    setActivityToAdd('');
  }

  function handleCopySuggested() {
    if (suggestedActivities.length === 0) {
      return;
    }

    onCopySuggested(
      selectedDate,
      suggestedActivities.map((activity) => activity.id),
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Puglia 2026</p>
        <h1>Programma</h1>
        <p className="page-subtitle">
          Organizza le giornate in base al vento e alle attività
          ancora da fare.
        </p>
      </header>

      <nav
        className="day-selector"
        aria-label="Seleziona il giorno"
      >
        {tripDays.map((day) => {
          const isSelected = day.date === selectedDate;

          return (
            <button
              key={day.date}
              type="button"
              className={`day-button ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedDate(day.date);
                setActivityToAdd('');
              }}
            >
              <span>{day.shortDay}</span>
              <strong>{day.dayNumber}</strong>
            </button>
          );
        })}
      </nav>

      <section className="selected-day-heading">
        <div>
          <p className="section-label">Giornata selezionata</p>
          <h2>{selectedTripDay.fullLabel}</h2>
        </div>

        {selectedDate === '2026-08-09' && (
          <span className="day-status-badge">Arrivo</span>
        )}

        {selectedDate === '2026-08-13' && (
          <span className="day-status-badge">Partenza</span>
        )}
      </section>

      <section className="card wind-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Vento previsto</p>
            <h2>Che vento ci sarà?</h2>
          </div>

          <span className="wind-symbol" aria-hidden="true">
            🌬️
          </span>
        </div>

        <div className="wind-options">
          {windOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`wind-button ${
                selectedPlan.selectedWind === option.value
                  ? 'selected'
                  : ''
              }`}
              onClick={() =>
                onUpdateWind(selectedDate, option.value)
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card itinerary-card">
        <div className="itinerary-section-header">
          <div>
            <div className="recommendation-badge">
              Itinerario consigliato
            </div>

            {suggestedItinerary && (
              <>
                <p className="section-label">
                  Costa {suggestedItinerary.coast}
                </p>

                <h2>{suggestedItinerary.name}</h2>
              </>
            )}
          </div>
        </div>

        {suggestedItinerary &&
        suggestedActivities.length > 0 ? (
          <>
            <p className="itinerary-description">
              {suggestedItinerary.description}
            </p>

            <div className="timeline">
              {suggestedActivities.map((activity, index) => {
                const directionsUrl =
                    createAppleMapsDirectionsUrl(activity);

                return (
                    <article
                    className="timeline-item"
                    key={activity.id}
                    >
                    <div className="timeline-marker">
                        <span>{index + 1}</span>
                    </div>

                    <div>
                        <h3>{activity.name}</h3>
                        <p>{activity.description}</p>

                        {activity.practicalNote && (
                        <p className="practical-note">
                            {activity.practicalNote}
                        </p>
                        )}

                        {directionsUrl && (
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-directions-link"
                        >
                            🚗 Naviga qui
                        </a>
                        )}
                    </div>
                    </article>
                );
                })}
            </div>

            <button
              type="button"
              className="copy-itinerary-button"
              onClick={handleCopySuggested}
            >
              Usa come mio itinerario
            </button>
          </>
        ) : (
          <div className="small-empty-state">
            <span aria-hidden="true">🎉</span>
            <div>
              <h3>Nessun suggerimento disponibile</h3>
              <p>
                Avete già completato le attività compatibili con
                questo vento, oppure il vento è ancora variabile.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="card custom-itinerary-card">
        <div className="custom-itinerary-heading">
          <div>
            <p className="section-label">Personalizzato</p>
            <h2>Il mio itinerario</h2>
          </div>

          <span className="custom-itinerary-icon">✏️</span>
        </div>

        <div className="add-itinerary-activity">
          <select
            value={activityToAdd}
            onChange={(event) =>
              setActivityToAdd(event.target.value)
            }
          >
            <option value="">Scegli un’attività...</option>

            {availableActivities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="primary-add-button"
            onClick={handleAddActivity}
            disabled={!activityToAdd}
          >
            Aggiungi
          </button>
        </div>

        {customItineraryActivities.length > 0 ? (
          <div className="custom-itinerary-list">
{customItineraryActivities.map(
  (activity, index) => {
    const directionsUrl =
      createAppleMapsDirectionsUrl(activity);

    return (
      <article
        className="custom-itinerary-item"
        key={activity.id}
      >
        <div className="custom-itinerary-number">
          {index + 1}
        </div>

        <div className="custom-itinerary-content">
          <h3>{activity.name}</h3>
          <p>{activity.description}</p>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-directions-link"
            >
              🚗 Naviga qui
            </a>
          )}
        </div>

        <div className="itinerary-actions">
          <button
            type="button"
            onClick={() =>
              onMoveActivity(
                selectedDate,
                activity.id,
                'up',
              )
            }
            disabled={index === 0}
            aria-label={`Sposta ${activity.name} verso l’alto`}
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() =>
              onMoveActivity(
                selectedDate,
                activity.id,
                'down',
              )
            }
            disabled={
              index ===
              customItineraryActivities.length - 1
            }
            aria-label={`Sposta ${activity.name} verso il basso`}
          >
            ↓
          </button>

          <button
            type="button"
            className="remove-itinerary-item"
            onClick={() =>
              onRemoveActivity(
                selectedDate,
                activity.id,
              )
            }
            aria-label={`Rimuovi ${activity.name}`}
          >
            ×
          </button>
        </div>
      </article>
    );
  },
)}
          </div>
        ) : (
          <div className="small-empty-state">
            <span aria-hidden="true">📋</span>

            <div>
              <h3>Itinerario ancora vuoto</h3>
              <p>
                Aggiungi le attività manualmente oppure copia
                l’itinerario consigliato.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}