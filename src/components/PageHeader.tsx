import type { ReactNode } from 'react';
import { defaultActivities } from '../data/activities';
import { createDirectionsUrl } from '../utils/maps';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

const home = defaultActivities.find((item) => item.id === 'casa');

/*
 * L'intestazione è un piccolo manifesto: cielo del tramonto con la
 * skyline di Parigi (Arc de Triomphe, Tour Eiffel, Invalides, Notre-Dame,
 * Sacré-Cœur, Tour Montparnasse). In alto a destra, la scorciatoia per
 * tornare a casa.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  const homeUrl = home ? createDirectionsUrl(home, 'transit') : null;

  return (
    <header className="page-header">
      <div className="poster">
        <div className="poster-text">
          <span className="poster-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
        </div>

        {homeUrl && (
          <a
            className="home-link"
            href={homeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Torna a casa: indicazioni con i mezzi"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" />
            </svg>
            Casa
          </a>
        )}

        <div className="skyline" aria-hidden="true" />
      </div>

      {(subtitle || action) && (
        <div className="page-header-row">
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
          {action}
        </div>
      )}
    </header>
  );
}
