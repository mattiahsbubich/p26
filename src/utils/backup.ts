export interface P26Backup {
  app: 'P26';
  version: 1;
  exportedAt: string;
  data: Record<string, string | null>;
}

export const BACKUP_STORAGE_KEYS = [
  'p26-custom-activities',
  'p26-completed-activities',
  'p26-day-plans',
  'p26-activity-reviews',
  'p26-selected-wind',
  'p26-visited-beaches',
] as const;

export function createBackup(): P26Backup {
  const data: Record<string, string | null> = {};

  for (const key of BACKUP_STORAGE_KEYS) {
    data[key] = localStorage.getItem(key);
  }

  return {
    app: 'P26',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup(): void {
  const backup = createBackup();

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `p26-backup-${date}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function validateBackup(
  value: unknown,
): value is P26Backup {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const candidate = value as Partial<P26Backup>;

  if (
    candidate.app !== 'P26' ||
    candidate.version !== 1 ||
    typeof candidate.data !== 'object' ||
    candidate.data === null
  ) {
    return false;
  }

  return true;
}

export async function readBackupFile(
  file: File,
): Promise<P26Backup> {
  const text = await file.text();

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      'Il file selezionato non contiene un JSON valido.',
    );
  }

  if (!validateBackup(parsed)) {
    throw new Error(
      'Il file non è un backup valido di P26.',
    );
  }

  return parsed;
}

export function restoreBackup(
  backup: P26Backup,
): void {
  for (const key of BACKUP_STORAGE_KEYS) {
    const value = backup.data[key];

    if (typeof value === 'string') {
      /*
       * Verifichiamo anche che il contenuto salvato sia
       * effettivamente JSON valido.
       */
      JSON.parse(value);
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}