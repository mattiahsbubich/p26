import { useMemo, useState } from 'react';
import { activityTypeLabels } from '../data/activityTypes';
import { stopKindLabels } from '../data/stopKinds';
import type {
  Activity,
  PlanItem,
  StopKind,
} from '../types';
import { createId } from '../utils/id';
import { TypeIcon } from './Icons';
import { PlaceForm } from './PlaceForm';
import { Sheet } from './Sheet';

interface AddStopSheetProps {
  dayLabel: string;
  activities: Activity[];
  activityIdsInDay: string[];
  onAddActivity: (activity: Activity) => void;
  onAddItem: (item: PlanItem) => void;
  onClose: () => void;
}

type Mode = 'existing' | 'new' | 'free';

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'existing', label: 'Dai luoghi' },
  { id: 'new', label: 'Nuovo luogo' },
  { id: 'free', label: 'Pausa / nota' },
];

export function AddStopSheet({
  dayLabel,
  activities,
  activityIdsInDay,
  onAddActivity,
  onAddItem,
  onClose,
}: AddStopSheetProps) {
  const [mode, setMode] = useState<Mode>('existing');

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  const [freeTitle, setFreeTitle] = useState('');
  const [freeKind, setFreeKind] = useState<StopKind>('meal');

  const available = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter(
      (activity) =>
        !activityIdsInDay.includes(activity.id) &&
        activity.name.toLowerCase().includes(query),
    );
  }, [activities, activityIdsInDay, search]);

  function addExisting() {
    if (!selectedId) {
      return;
    }

    onAddItem({
      id: createId(),
      activityId: selectedId,
      time: time.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  }

  function addFree(event: React.FormEvent) {
    event.preventDefault();

    if (!freeTitle.trim()) {
      return;
    }

    onAddItem({
      id: createId(),
      title: freeTitle.trim(),
      kind: freeKind,
      time: time.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  }

  const scheduleFields = (
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
        Nota
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
        />
      </label>
    </>
  );

  return (
    <Sheet
      title="Aggiungi una tappa"
      eyebrow={dayLabel}
      onClose={onClose}
    >
      <div className="segmented" role="tablist">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={mode === item.id ? 'selected' : ''}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'existing' && (
        <div className="stack-form">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cerca un luogo..."
            aria-label="Cerca un luogo"
          />

          <div className="pick-list" role="listbox">
            {available.length === 0 && (
              <p className="muted">
                Nessun luogo disponibile. Crea un nuovo luogo dalla
                scheda “Nuovo luogo”.
              </p>
            )}

            {available.map((activity) => (
              <button
                key={activity.id}
                type="button"
                role="option"
                aria-selected={selectedId === activity.id}
                className={`pick-item ${
                  selectedId === activity.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedId(activity.id)}
              >
                <span className="pick-icon">
                  <TypeIcon type={activity.type} size={20} />
                </span>

                <span>
                  <strong>{activity.name}</strong>
                  <small>{activityTypeLabels[activity.type]}</small>
                </span>
              </button>
            ))}
          </div>

          {selectedId && scheduleFields}

          <button
            type="button"
            className="button primary block"
            onClick={addExisting}
            disabled={!selectedId}
          >
            Aggiungi al giorno
          </button>
        </div>
      )}

      {mode === 'new' && (
        <PlaceForm
          withSchedule
          submitLabel="Crea e aggiungi al giorno"
          onSubmit={(activity, extras) => {
            onAddActivity(activity);

            onAddItem({
              id: createId(),
              activityId: activity.id,
              time: extras.time,
              note: extras.note,
            });

            onClose();
          }}
        />
      )}

      {mode === 'free' && (
        <form className="stack-form" onSubmit={addFree}>
          <label>
            Titolo
            <input
              value={freeTitle}
              onChange={(event) => setFreeTitle(event.target.value)}
              placeholder="Es. Aperitivo sulla Senna"
              required
            />
          </label>

          <label>
            Tipo
            <select
              value={freeKind}
              onChange={(event) =>
                setFreeKind(event.target.value as StopKind)
              }
            >
              {Object.entries(stopKindLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>

          {scheduleFields}

          <button
            type="submit"
            className="button primary block"
            disabled={!freeTitle.trim()}
          >
            Aggiungi al giorno
          </button>
        </form>
      )}
    </Sheet>
  );
}
