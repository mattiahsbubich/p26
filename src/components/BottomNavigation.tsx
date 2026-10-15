import { NavIcons } from './Icons';

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
  icon: (props: { size?: number }) => React.ReactNode;
}> = [
  { id: 'program', label: 'Programma', icon: NavIcons.program },
  { id: 'map', label: 'Mappa', icon: NavIcons.map },
  { id: 'activities', label: 'Luoghi', icon: NavIcons.places },
  { id: 'ratings', label: 'Pagelle', icon: NavIcons.ratings },
  { id: 'settings', label: 'Altro', icon: NavIcons.more },
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
      <div className="bottom-navigation-inner">
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
              {item.icon({ size: 24 })}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
