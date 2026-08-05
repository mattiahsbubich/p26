export type PageId =
  | 'program'
  | 'map'
  | 'activities'
  | 'ratings'
  | 'settings';

interface BottomNavigationProps {
  currentPage: PageId;
  onChange: (page: PageId) => void;
}

const items: Array<{
  id: PageId;
  label: string;
  icon: string;
}> = [
  {
    id: 'program',
    label: 'Programma',
    icon: '📅',
  },
  {
    id: 'map',
    label: 'Mappa',
    icon: '🗺️',
  },
  {
    id: 'activities',
    label: 'Attività',
    icon: '📍',
  },
  {
    id: 'ratings',
    label: 'Pagelle',
    icon: '⭐️',
  },
  {
    id: 'settings',
    label: 'Altro',
    icon: '⚙️',
  },
];

export function BottomNavigation({
  currentPage,
  onChange,
}: BottomNavigationProps) {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Navigazione principale"
    >
      {items.map((item) => {
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`navigation-item ${
              isActive ? 'active' : ''
            }`}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className="navigation-icon"
              aria-hidden="true"
            >
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}