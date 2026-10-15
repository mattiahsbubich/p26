import { ALL_STORAGE_KEYS } from './storage';

export interface Paris26Backup {
  app: 'PARIGI26';
  version: 1;
  exportedAt: string;
  data: Record<string, string | null>;
}

export function createBackup(): Paris26Backup {
  const data: Record<string, string | null> = {};

  for (const key of ALL_STORAGE_KEYS) {
    data[key] = localStorage.getItem(key);
  }

  return {
    app: 'PARIGI26',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup(): void {
  const json = JSON.stringify(createBackup(), null, 2);

  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json' }),
  );

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `parigi26-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function validateBackup(
  value: unknown,
): value is Paris26Backup {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<Paris26Backup>;

  return (
    candidate.app === 'PARIGI26' &&
    candidate.version === 1 &&
    typeof candidate.data === 'object' &&
    candidate.data !== null
  );
}

export async function readBackupFile(
  file: File,
): Promise<Paris26Backup> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('Il file selezionato non contiene un JSON valido.');
  }

  if (!validateBackup(parsed)) {
    throw new Error('Il file non è un backup valido di Parigi 2026.');
  }

  return parsed;
}

export function restoreBackup(backup: Paris26Backup): void {
  /*
   * Prima verifichiamo tutto, poi scriviamo: un backup rovinato
   * non deve lasciare i dati a metà.
   */
  for (const key of ALL_STORAGE_KEYS) {
    const value = backup.data[key];

    if (typeof value === 'string') {
      JSON.parse(value);
    }
  }

  for (const key of ALL_STORAGE_KEYS) {
    const value = backup.data[key];

    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}
