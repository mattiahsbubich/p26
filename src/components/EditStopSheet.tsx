import { useState } from 'react';
import { stopKindLabels } from '../data/stopKinds';
import type {
  Activity,
  PlanItem,
  StopKind,
} from '../types';
import { Sheet } from './Sheet';

interface EditStopSheetProps {
  item: PlanItem;
  activity?: Activity;
  onSave: (patch: Partial<PlanItem>) => void;
  onClose: () => void;
}

export function EditStopSheet({
  item,
  activity,
  onSave,
  onClose,
}: EditStopSheetProps) {
  const [title, setTitle] = useState(item.title ?? '');
  const [time, setTime] = useState(item.time ?? '');
  const [note, setNote] = useState(item.note ?? '');
  const [kind, setKind] = useState<StopKind>(item.kind ?? 'free');

  const isFree = !activity;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isFree && !title.trim()) {
      return;
    }

    onSave({
      title: title.trim() || undefined,
      time: time.trim() || undefined,
      note: note.trim() || undefined,
      kind: isFree ? kind : item.kind,
    });

    onClose();
  }

  return (
    <Sheet
      title="Modifica tappa"
      eyebrow={activity ? activity.name : 'Pausa / nota'}
      onClose={onClose}
    >
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Titolo
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={activity?.name ?? 'Titolo della tappa'}
            required={isFree}
          />

          {activity && (
            <span className="field-help">
              Lascia vuoto per usare il nome del luogo.
            </span>
          )}
        </label>

        {isFree && (
          <label>
            Tipo
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as StopKind)
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
        )}

        <label>
          Orario
          <input
            value={time}
            onChange={(event) => setTime(event.target.value)}
            placeholder="Es. 15:00"
          />
        </label>

        <label>
          Nota
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
          />
        </label>

        <button type="submit" className="button primary block">
          Salva modifiche
        </button>
      </form>
    </Sheet>
  );
}
