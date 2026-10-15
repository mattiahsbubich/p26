import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}

/*
 * Pannello a comparsa dal basso, pensato per il telefono.
 * Si chiude toccando lo sfondo, con il pulsante o con Esc.
 */
export function Sheet({
  title,
  eyebrow,
  onClose,
  children,
}: SheetProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="sheet-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="sheet-header">
          <div>
            {eyebrow && <p className="section-label">{eyebrow}</p>}
            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Chiudi"
          >
            ×
          </button>
        </header>

        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
