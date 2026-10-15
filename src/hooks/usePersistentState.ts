import { useCallback, useRef, useState } from 'react';
import { readStored, writeStored } from '../utils/storage';

type Updater<T> = T | ((current: T) => T);

/*
 * Stato salvato in localStorage. Scrive solo quando lo stato cambia
 * (non al primo render), così i dati predefiniti non vengono "congelati"
 * finché l'utente non modifica qualcosa.
 *
 * `parse` riceve il valore grezzo salvato e restituisce lo stato valido,
 * oppure undefined per usare il valore iniziale.
 */
export function usePersistentState<T>(
  key: string,
  createInitial: () => T,
  parse: (raw: unknown) => T | undefined,
): [T, (next: Updater<T>) => void] {
  const [value, setValue] = useState<T>(() => {
    const raw = readStored(key);

    if (raw === undefined) {
      return createInitial();
    }

    return parse(raw) ?? createInitial();
  });

  const latest = useRef(value);

  const update = useCallback(
    (next: Updater<T>) => {
      const resolved =
        typeof next === 'function'
          ? (next as (current: T) => T)(latest.current)
          : next;

      latest.current = resolved;
      setValue(resolved);
      writeStored(key, resolved);
    },
    [key],
  );

  return [value, update];
}

export function parseStringArray(raw: unknown): string[] | undefined {
  return Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string')
    : undefined;
}
