import type { Activity } from '../types';
import {
  createDirectionsUrl,
  createViewUrl,
} from '../utils/maps';
import { FootIcon, TrainIcon } from './Icons';

interface DirectionsLinksProps {
  activity: Activity;
  /* Aggiunge il link per aprire il luogo nell'app mappe. */
  includeView?: boolean;
}

export function DirectionsLinks({
  activity,
  includeView = false,
}: DirectionsLinksProps) {
  const transit = createDirectionsUrl(activity, 'transit');
  const walking = createDirectionsUrl(activity, 'walking');
  const view = createViewUrl(activity);

  if (!transit || !walking) {
    return null;
  }

  return (
    <div className="direction-links">
      <a
        className="button small primary"
        href={transit}
        target="_blank"
        rel="noreferrer"
      >
        <TrainIcon size={16} />
        Mezzi
      </a>

      <a
        className="button small outline"
        href={walking}
        target="_blank"
        rel="noreferrer"
      >
        <FootIcon size={16} />
        A piedi
      </a>

      {includeView && view && (
        <a
          className="button small outline"
          href={view}
          target="_blank"
          rel="noreferrer"
        >
          Vedi in Mappe
        </a>
      )}
    </div>
  );
}
