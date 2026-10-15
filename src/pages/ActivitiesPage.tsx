import { useMemo, useState } from 'react';
import { BookingBadge } from '../components/BookingBadge';
import { DirectionsLinks } from '../components/DirectionsLinks';
import { EditPlaceSheet } from '../components/EditPlaceSheet';
import { CheckIcon, TypeIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { PlaceForm } from '../components/PlaceForm';
import { Sheet } from '../components/Sheet';
import {
  activityTypeLabels,
  activityTypeOrder,
  isRateable,
} from '../data/activityTypes';
import { tripDays } from '../data/trip';
import type {
  Activity,
  ActivityType,
  DayPlan,
} from '../types';

interface ActivitiesPageProps {
  activities: Activity[];
  completedActivityIds: string[];
  bookedActivityIds: string[];
  dayPlans: DayPlan[];
  onToggleCompleted: (activityId: string) => void;
  onToggleBooked: (activityId: string) => void;
  onAddActivity: (activity: Activity) => void;
  onRemoveCustomActivity: (activityId: string) => void;
  onAddToDay: (date: string, activityId: string) => void;
  onUpdatePlace: (
    activityId: string,
    patch: Pick<Activity, 'name' | 'address' | 'latitude' | 'longitude'>,
  ) => void;
}

type Filter = 'all' | 'must' | 'booking' | 'unplanned' | ActivityType;

export function ActivitiesPage({
  activities,
  completedActivityIds,
  bookedActivityIds,
  dayPlans,
  onToggleCompleted,
  onToggleBooked,
  onAddActivity,
  onRemoveCustomActivity,
  onAddToDay,
  onUpdatePlace,
}: ActivitiesPageProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [planning, setPlanning] = useState<Activity | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);

  const daysByActivity = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const plan of dayPlans) {
      for (const item of plan.items) {
        if (item.activityId) {
          map.set(item.activityId, [
            ...(map.get(item.activityId) ?? []),
            plan.date,
          ]);
        }
      }
    }

    return map;
  }, [dayPlans]);

  const presentTypes = activityTypeOrder.filter((type) =>
    activities.some((activity) => activity.type === type),
  );

  const visible = activities.filter((activity) => {
    switch (filter) {
      case 'all':
        return true;

      case 'must':
        return Boolean(activity.must);

      case 'booking':
        return Boolean(activity.booking);

      case 'unplanned':
        return !daysByActivity.has(activity.id);

      default:
        return activity.type === filter;
    }
  });

  const rateable = activities.filter((activity) =>
    isRateable(activity.type),
  );

  const doneCount = rateable.filter((activity) =>
    completedActivityIds.includes(activity.id),
  ).length;

  function handleDelete(activity: Activity) {
    if (window.confirm(`Eliminare “${activity.name}”?`)) {
      onRemoveCustomActivity(activity.id);
    }
  }

  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'Tutti' },
    { id: 'must', label: 'Imperdibili' },
    { id: 'booking', label: 'Biglietti' },
    { id: 'unplanned', label: 'Non in programma' },
    ...presentTypes.map((type) => ({
      id: type as Filter,
      label: activityTypeLabels[type],
    })),
  ];

  return (
    <main className="page">
      <PageHeader
        eyebrow="Programma"
        title="Luoghi"
        subtitle={`${doneCount} di ${rateable.length} fatti`}
        action={
          <button
            type="button"
            className="button small primary"
            onClick={() => setShowForm(true)}
          >
            + Nuovo
          </button>
        }
      />

      <div className="filter-bar" role="tablist">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`filter-chip ${
              filter === item.id ? 'selected' : ''
            }`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="place-list">
        {visible.length === 0 && (
          <div className="empty-state">
            <h3>Nessun luogo</h3>
            <p>Nessun luogo corrisponde a questo filtro.</p>
          </div>
        )}

        {visible.map((activity) => {
          const isDone = completedActivityIds.includes(activity.id);
          const days = daysByActivity.get(activity.id) ?? [];

          return (
            <article
              key={activity.id}
              className={`place-card ${isDone ? 'done' : ''}`}
            >
              <div className="place-card-header">
                <span className="place-icon">
                  <TypeIcon type={activity.type} size={22} />
                </span>

                <div className="place-title">
                  <p className="section-label">
                    {activityTypeLabels[activity.type]}
                  </p>
                  <h2>{activity.name}</h2>
                </div>

                {isRateable(activity.type) && (
                  <button
                    type="button"
                    className="check-button"
                    onClick={() => onToggleCompleted(activity.id)}
                    aria-pressed={isDone}
                    aria-label={
                      isDone
                        ? `Segna ${activity.name} come non fatto`
                        : `Segna ${activity.name} come fatto`
                    }
                  >
                    {isDone && <CheckIcon size={16} />}
                  </button>
                )}
              </div>

              <p className="place-description">
                {activity.description}
              </p>

              {activity.address && (
                <p className="place-address">{activity.address}</p>
              )}

              <div className="stop-meta">
                {activity.must && (
                  <span className="stub must">Imperdibile</span>
                )}

                <BookingBadge
                  activity={activity}
                  booked={bookedActivityIds.includes(activity.id)}
                  onToggle={() => onToggleBooked(activity.id)}
                />

                {days.map((date) => {
                  const day = tripDays.find(
                    (item) => item.date === date,
                  );

                  return day ? (
                    <span
                      key={`${date}-${activity.id}`}
                      className="day-chip"
                      style={
                        {
                          '--line': day.lineColor,
                          '--line-ink': day.lineInk,
                        } as React.CSSProperties
                      }
                    >
                      <span className="roundel mini">
                        {day.dayNumber}
                      </span>
                      {day.shortDay}
                    </span>
                  ) : null;
                })}
              </div>

              {activity.practicalNote && (
                <p className="callout-inline">
                  {activity.practicalNote}
                </p>
              )}

              <DirectionsLinks activity={activity} includeView />

              <div className="place-actions">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setPlanning(activity)}
                >
                  + Aggiungi a un giorno
                </button>

                <button
                  type="button"
                  className="link-button"
                  onClick={() => setEditing(activity)}
                >
                  {activity.latitude === undefined
                    ? 'Imposta indirizzo'
                    : 'Cambia indirizzo'}
                </button>

                {activity.custom && (
                  <button
                    type="button"
                    className="link-button danger"
                    onClick={() => handleDelete(activity)}
                  >
                    Elimina
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {showForm && (
        <Sheet
          title="Nuovo luogo"
          eyebrow="Luoghi"
          onClose={() => setShowForm(false)}
        >
          <PlaceForm
            submitLabel="Salva luogo"
            onSubmit={(activity) => {
              onAddActivity(activity);
              setShowForm(false);
            }}
          />
        </Sheet>
      )}

      {editing && (
        <EditPlaceSheet
          activity={editing}
          onSave={(patch) => onUpdatePlace(editing.id, patch)}
          onClose={() => setEditing(null)}
        />
      )}

      {planning && (
        <Sheet
          title="Aggiungi a un giorno"
          eyebrow={planning.name}
          onClose={() => setPlanning(null)}
        >
          <div className="move-days">
            {tripDays.map((day) => (
              <button
                key={day.date}
                type="button"
                className="move-day"
                style={
                  {
                    '--line': day.lineColor,
                    '--line-ink': day.lineInk,
                  } as React.CSSProperties
                }
                onClick={() => {
                  onAddToDay(day.date, planning.id);
                  setPlanning(null);
                }}
              >
                <span className="roundel">{day.dayNumber}</span>

                <span>
                  <strong>{day.fullLabel}</strong>
                  <small>{day.zone}</small>
                </span>
              </button>
            ))}
          </div>

          <p className="muted">
            La tappa viene aggiunta in fondo al giorno: poi puoi
            riordinarla dal Programma.
          </p>
        </Sheet>
      )}
    </main>
  );
}
