import type { Activity } from '../types';
import { CheckIcon } from './Icons';

interface BookingBadgeProps {
  activity: Activity;
  booked: boolean;
  onToggle?: () => void;
}

/*
 * Una "contromarca" tratteggiata, come un biglietto da strappare.
 * Toccandola si segna il biglietto come prenotato.
 */
export function BookingBadge({
  activity,
  booked,
  onToggle,
}: BookingBadgeProps) {
  if (!activity.booking) {
    return null;
  }

  const label = booked
    ? 'Prenotato'
    : activity.booking === 'required'
      ? 'Da prenotare'
      : 'Verificare slot';

  const className = `stub ${booked ? 'booked' : ''}`;

  const content = (
    <>
      {booked && <CheckIcon size={11} />}
      {label}
    </>
  );

  if (!onToggle) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-pressed={booked}
      title="Tocca per segnare come prenotato"
    >
      {content}
    </button>
  );
}
