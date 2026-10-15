import { useMemo, useState } from 'react';
import { AddStopSheet } from '../components/AddStopSheet';
import { BookingBadge } from '../components/BookingBadge';
import { DirectionsLinks } from '../components/DirectionsLinks';
import { EditStopSheet } from '../components/EditStopSheet';
import {
  ArrowIcon,
  CheckIcon,
  PencilIcon,
  SwapIcon,
  TrashIcon,
} from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { Sheet } from '../components/Sheet';
import {
  activityTypeLabels,
  isRateable,
} from '../data/activityTypes';
import {
  TRIP_DATES_LABEL,
  TRIP_START,
  tripDays,
} from '../data/trip';
import type { DayPlansApi } from '../hooks/useDayPlans';
import type {
  Activity,
  PlanItem,
  TripDay,
} from '../types';

interface ProgramPageProps {
  activities: Activity[];
  completedActivityIds: string[];
  bookedActivityIds: string[];
  plans: DayPlansApi;
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
  onToggleBooked: (activityId: string) => void;
  onToggleItemDone: (
    date: string,
    item: PlanItem,
    activity?: Activity,
  ) => void;
  onAddActivity: (activity: Activity) => void;
  onShowOnMap: (date: string) => void;
}

function lineStyle(day: TripDay): React.CSSProperties {
  return {
    '--line': day.lineColor,
    '--line-ink': day.lineInk,
  } as React.CSSProperties;
}

function describeCountdown(todayDate: string): string | null {
  const lastDate = tripDays[tripDays.length - 1].date;

  if (todayDate < TRIP_START) {
    const toMidnight = (value: string) => {
      const [year, month, day] = value.split('-').map(Number);

      return Date.UTC(year, month - 1, day);
    };

    const days = Math.round(
      (toMidnight(TRIP_START) - toMidnight(todayDate)) / 86_400_000,
    );

    return days === 1
      ? 'Si parte domani'
      : `Mancano ${days} giorni alla partenza`;
  }

  if (todayDate > lastDate) {
    return 'Viaggio concluso: ora le pagelle!';
  }

  const index = tripDays.findIndex((day) => day.date === todayDate);

  return `Oggi è il giorno ${index + 1} di ${tripDays.length}`;
}

export function ProgramPage({
  activities,
  completedActivityIds,
  bookedActivityIds,
  plans,
  selectedDate,
  todayDate,
  onSelectDate,
  onToggleBooked,
  onToggleItemDone,
  onAddActivity,
  onShowOnMap,
}: ProgramPageProps) {
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingItemId, setEditingItemId] =
    useState<string | null>(null);
  const [movingItemId, setMovingItemId] =
    useState<string | null>(null);

  const day =
    tripDays.find((item) => item.date === selectedDate) ??
    tripDays[0];

  const plan =
    plans.dayPlans.find((item) => item.date === day.date) ??
    plans.dayPlans[0];

  const activityById = useMemo(
    () => new Map(activities.map((item) => [item.id, item])),
    [activities],
  );

  const stops = useMemo(
    () =>
      plan.items.map((item) => ({
        item,
        activity: item.activityId
          ? activityById.get(item.activityId)
          : undefined,
      })),
    [plan.items, activityById],
  );

  function isDone(item: PlanItem, activity?: Activity): boolean {
    return (
      Boolean(item.done) ||
      (activity !== undefined &&
        isRateable(activity.type) &&
        completedActivityIds.includes(activity.id))
    );
  }

  const doneCount = stops.filter(({ item, activity }) =>
    isDone(item, activity),
  ).length;

  const pendingBookings = stops.filter(
    ({ activity }) =>
      activity?.booking === 'required' &&
      !bookedActivityIds.includes(activity.id),
  ).length;

  const editingStop = stops.find(
    ({ item }) => item.id === editingItemId,
  );

  const movingStop = stops.find(
    ({ item }) => item.id === movingItemId,
  );

  const countdown = describeCountdown(todayDate);

  function handleRemove(item: PlanItem, label: string) {
    if (window.confirm(`Togliere “${label}” dal programma?`)) {
      plans.removeItem(day.date, item.id);
    }
  }

  function handleReset() {
    if (
      window.confirm(
        `Ripristinare l’itinerario originale di ${day.fullLabel.toLowerCase()}? Le modifiche a questo giorno andranno perse.`,
      )
    ) {
      plans.resetDay(day.date);
    }
  }

  return (
    <main className="page" style={lineStyle(day)}>
      <PageHeader
        eyebrow={`Parigi · ${TRIP_DATES_LABEL}`}
        title="Programma"
        subtitle={countdown}
      />

      <nav
        className="day-selector"
        aria-label="Seleziona il giorno"
      >
        {tripDays.map((item) => {
          const isSelected = item.date === day.date;

          return (
            <button
              key={item.date}
              type="button"
              className={`day-button ${
                isSelected ? 'selected' : ''
              } ${item.date === todayDate ? 'today' : ''}`}
              style={lineStyle(item)}
              onClick={() => onSelectDate(item.date)}
              aria-pressed={isSelected}
            >
              <span className="roundel">{item.dayNumber}</span>
              <span className="day-button-label">
                {item.shortDay}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="day-card">
        <div className="day-card-head">
          <span className="roundel big">{day.dayNumber}</span>

          <div>
            <p className="day-date">
              {day.fullLabel}
              {day.badge && (
                <span className="day-badge">{day.badge}</span>
              )}
            </p>

            <h2>{day.zone}</h2>
          </div>
        </div>

        <p className="day-tagline">{day.tagline}</p>

        <p className="day-route">
          <span>Percorso</span> {day.route}
        </p>

        <div className="day-stats">
          <span>
            <strong>{doneCount}</strong>/{stops.length} fatte
          </span>

          {pendingBookings > 0 && (
            <span className="alert">
              <strong>{pendingBookings}</strong> da prenotare
            </span>
          )}

          <button
            type="button"
            className="link-button"
            onClick={() => onShowOnMap(day.date)}
          >
            Vedi sulla mappa ›
          </button>
        </div>
      </section>

      <section className="itinerary" aria-label="Tappe del giorno">
        <div className="itinerary-heading">
          <h2 className="rule-heading">Il programma</h2>

          <button
            type="button"
            className={`button small ${
              editMode ? 'primary' : 'outline'
            }`}
            onClick={() => setEditMode((current) => !current)}
            aria-pressed={editMode}
          >
            <PencilIcon size={16} />
            {editMode ? 'Fine' : 'Modifica'}
          </button>
        </div>

        {stops.length === 0 ? (
          <div className="empty-state">
            <h3>Giornata libera</h3>
            <p>
              Nessuna tappa in programma. Aggiungine una oppure
              ripristina l’itinerario originale.
            </p>
          </div>
        ) : (
          <ol className="stops">
            {stops.map(({ item, activity }, index) => {
              const done = isDone(item, activity);

              const title =
                item.title ?? activity?.name ?? 'Tappa';

              const isMinor =
                !activity || activity.type === 'logistics';

              const note =
                item.note ??
                (activity && !activity.booking
                  ? activity.practicalNote
                  : undefined);

              return (
                <li
                  key={item.id}
                  className={`stop ${isMinor ? 'minor' : ''} ${
                    done ? 'done' : ''
                  }`}
                >
                  <div className="stop-time">
                    {item.time ?? ''}
                  </div>

                  <div className="stop-rail">
                    <button
                      type="button"
                      className="stop-check"
                      onClick={() =>
                        onToggleItemDone(day.date, item, activity)
                      }
                      aria-pressed={done}
                      aria-label={
                        done
                          ? `Segna “${title}” come da fare`
                          : `Segna “${title}” come fatta`
                      }
                    >
                      <span className="stop-dot">
                        {done && !isMinor && <CheckIcon size={12} />}
                      </span>
                    </button>
                  </div>

                  <div className="stop-body">
                    <h3>{title}</h3>

                    {activity && (
                      <div className="stop-meta">
                        {activity.type !== 'logistics' && (
                          <span className="chip">
                            {activityTypeLabels[activity.type]}
                          </span>
                        )}

                        <BookingBadge
                          activity={activity}
                          booked={bookedActivityIds.includes(
                            activity.id,
                          )}
                          onToggle={() =>
                            onToggleBooked(activity.id)
                          }
                        />
                      </div>
                    )}

                    {note && <p className="stop-note">{note}</p>}

                    {activity && !editMode && (
                      <DirectionsLinks activity={activity} />
                    )}

                    {editMode && (
                      <div className="stop-tools">
                        <button
                          type="button"
                          onClick={() =>
                            plans.moveItem(day.date, item.id, 'up')
                          }
                          disabled={index === 0}
                        >
                          <ArrowIcon direction="up" />
                          Su
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            plans.moveItem(day.date, item.id, 'down')
                          }
                          disabled={index === stops.length - 1}
                        >
                          <ArrowIcon direction="down" />
                          Giù
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          <PencilIcon />
                          Modifica
                        </button>

                        <button
                          type="button"
                          onClick={() => setMovingItemId(item.id)}
                        >
                          <SwapIcon />
                          Giorno
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleRemove(item, title)}
                        >
                          <TrashIcon />
                          Togli
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <button
          type="button"
          className="button dashed block"
          onClick={() => setAdding(true)}
        >
          + Aggiungi una tappa
        </button>

        {editMode && (
          <button
            type="button"
            className="link-button center"
            onClick={handleReset}
          >
            Ripristina l’itinerario originale di questo giorno
          </button>
        )}
      </section>

      {day.tips.map((tip) => (
        <aside
          key={tip.title}
          className={`callout ${tip.tone}`}
        >
          <h3>{tip.title}</h3>
          <p>{tip.text}</p>
        </aside>
      ))}

      {adding && (
        <AddStopSheet
          dayLabel={day.fullLabel}
          activities={activities}
          activityIdsInDay={plan.items
            .map((item) => item.activityId)
            .filter((id): id is string => id !== undefined)}
          onAddActivity={onAddActivity}
          onAddItem={(item) => plans.addItem(day.date, item)}
          onClose={() => setAdding(false)}
        />
      )}

      {editingStop && (
        <EditStopSheet
          item={editingStop.item}
          activity={editingStop.activity}
          onSave={(patch) =>
            plans.updateItem(day.date, editingStop.item.id, patch)
          }
          onClose={() => setEditingItemId(null)}
        />
      )}

      {movingStop && (
        <Sheet
          title="Sposta in un altro giorno"
          eyebrow={
            movingStop.item.title ??
            movingStop.activity?.name ??
            'Tappa'
          }
          onClose={() => setMovingItemId(null)}
        >
          <div className="move-days">
            {tripDays
              .filter((item) => item.date !== day.date)
              .map((item) => (
                <button
                  key={item.date}
                  type="button"
                  className="move-day"
                  style={lineStyle(item)}
                  onClick={() => {
                    plans.moveItemToDay(
                      day.date,
                      movingStop.item.id,
                      item.date,
                    );

                    setMovingItemId(null);
                  }}
                >
                  <span className="roundel">{item.dayNumber}</span>

                  <span>
                    <strong>{item.fullLabel}</strong>
                    <small>{item.zone}</small>
                  </span>
                </button>
              ))}
          </div>

          <p className="muted">
            La tappa viene aggiunta in fondo al giorno scelto:
            poi puoi spostarla con le frecce.
          </p>
        </Sheet>
      )}
    </main>
  );
}
