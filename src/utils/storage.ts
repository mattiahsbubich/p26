/*
 * Prefisso "paris26-": il sito è pubblicato su github.io, dove tutte le
 * app dello stesso account condividono lo stesso localStorage. Così i dati
 * di Parigi non si mescolano con quelli di altre app (es. Puglia).
 */
export const STORAGE_KEYS = {
  customActivities: 'paris26-custom-activities',
  completed: 'paris26-completed-activities',
  booked: 'paris26-booked',
  dayPlans: 'paris26-day-plans',
  reviews: 'paris26-activity-reviews',
  packing: 'paris26-packing',
  placeOverrides: 'paris26-place-overrides',
  mapsProvider: 'paris26-maps-provider',
} as const;

export const ALL_STORAGE_KEYS: string[] = Object.values(STORAGE_KEYS);

export function readStored(key: string): unknown {
  try {
    const value = localStorage.getItem(key);

    return value === null ? undefined : (JSON.parse(value) as unknown);
  } catch {
    return undefined;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /*
     * Storage pieno o bloccato (es. navigazione privata):
     * l'app continua a funzionare, ma senza salvataggio.
     */
  }
}
