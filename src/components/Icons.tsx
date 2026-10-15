import type { ReactNode } from 'react';
import type { ActivityType } from '../types';

interface IconProps {
  size?: number;
}

function Svg({
  size = 22,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const NavIcons = {
  program: (props: IconProps) => (
    <Svg {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4M8 14h3M13 14h3M8 17h3" />
    </Svg>
  ),
  map: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
      <path d="M9 4v14M15 6v14" />
    </Svg>
  ),
  places: (props: IconProps) => (
    <Svg {...props}>
      <path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" />
      <circle cx="12" cy="11" r="2" />
    </Svg>
  ),
  ratings: (props: IconProps) => (
    <Svg {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8L12 3.5z" />
    </Svg>
  ),
  more: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </Svg>
  ),
};

const typeIcons: Record<ActivityType, (props: IconProps) => ReactNode> = {
  monument: (props) => (
    <Svg {...props}>
      <path d="M4 21V9a8 8 0 0 1 16 0v12M8 21v-8a4 4 0 0 1 8 0v8M3 21h18" />
    </Svg>
  ),
  museum: (props) => (
    <Svg {...props}>
      <path d="M3 9l9-5 9 5H3zM5.5 9v9M9.5 9v9M14.5 9v9M18.5 9v9M3 20.5h18" />
    </Svg>
  ),
  garden: (props) => (
    <Svg {...props}>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6M9 21h6" />
    </Svg>
  ),
  walk: (props) => (
    <Svg {...props}>
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M8 17c5 0 2-10 8-10" strokeDasharray="1 3" />
    </Svg>
  ),
  view: (props) => (
    <Svg {...props}>
      <path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 6v3M5 10l2 2M19 10l-2 2" />
    </Svg>
  ),
  food: (props) => (
    <Svg {...props}>
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10" />
    </Svg>
  ),
  shop: (props) => (
    <Svg {...props}>
      <path d="M5 8h14l-1 12H6L5 8zM9 8a3 3 0 0 1 6 0" />
    </Svg>
  ),
  logistics: (props) => (
    <Svg {...props}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Svg>
  ),
  custom: (props) => (
    <Svg {...props}>
      <path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" />
      <circle cx="12" cy="11" r="2" />
    </Svg>
  ),
};

export function TypeIcon({
  type,
  size,
}: {
  type: ActivityType;
  size?: number;
}) {
  return <>{typeIcons[type]({ size })}</>;
}

export function CheckIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ArrowIcon({
  direction,
  size = 18,
}: {
  direction: 'up' | 'down';
  size?: number;
}) {
  return (
    <Svg size={size}>
      <path
        d={
          direction === 'up'
            ? 'M12 19V5M6 11l6-6 6 6'
            : 'M12 5v14M6 13l6 6 6-6'
        }
      />
    </Svg>
  );
}

export function TrainIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 11h14M9 21l2-4M15 21l-2-4M9 14h.01M15 14h.01" />
    </Svg>
  );
}

export function FootIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="M9 21l2.5-6-2.5-3 3-4 3 2 2 3M11.5 15l3 2.5V21" />
    </Svg>
  );
}

export function PencilIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
    </Svg>
  );
}

export function TrashIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </Svg>
  );
}

export function SwapIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4" />
    </Svg>
  );
}

export function LocateIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </Svg>
  );
}
