import { useMemo } from 'react';
import { defaultActivities } from '../data/activities';
import type { Activity } from '../types';
import { STORAGE_KEYS } from '../utils/storage';
import {
  parseStringArray,
  usePersistentState,
} from './usePersistentState';

function parseActivities(raw: unknown): Activity[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  return raw.filter(
    (item): item is Activity =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Activity).id === 'string' &&
      typeof (item as Activity).name === 'string',
  );
}

/* Modifiche fatte dall'app a un luogo (nome, indirizzo, coordinate). */
export type PlaceOverride = Partial<
  Pick<Activity, 'name' | 'address' | 'latitude' | 'longitude'>
>;

function parseOverrides(
  raw: unknown,
): Record<string, PlaceOverride> | undefined {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw)
    ? (raw as Record<string, PlaceOverride>)
    : undefined;
}

export function useActivities() {
  const [customActivities, setCustomActivities] =
    usePersistentState<Activity[]>(
      STORAGE_KEYS.customActivities,
      () => [],
      parseActivities,
    );

  const [completedActivityIds, setCompletedActivityIds] =
    usePersistentState<string[]>(
      STORAGE_KEYS.completed,
      () => [],
      parseStringArray,
    );

  /*
   * Avete già prenotato tutto: di partenza ogni biglietto è "prenotato".
   * Si può comunque togliere la spunta dall'app.
   */
  const [bookedActivityIds, setBookedActivityIds] =
    usePersistentState<string[]>(
      STORAGE_KEYS.booked,
      () =>
        defaultActivities
          .filter((activity) => activity.booking)
          .map((activity) => activity.id),
      parseStringArray,
    );

  const [overrides, setOverrides] = usePersistentState<
    Record<string, PlaceOverride>
  >(STORAGE_KEYS.placeOverrides, () => ({}), parseOverrides);

  const activities = useMemo(
    () =>
      [...defaultActivities, ...customActivities].map((activity) =>
        overrides[activity.id]
          ? { ...activity, ...overrides[activity.id] }
          : activity,
      ),
    [customActivities, overrides],
  );

  function toggleId(
    setter: (next: (current: string[]) => string[]) => void,
    id: string,
  ) {
    setter((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function addActivity(activity: Activity) {
    setCustomActivities((current) => [...current, activity]);
  }

  function removeCustomActivity(activityId: string) {
    setCustomActivities((current) =>
      current.filter((activity) => activity.id !== activityId),
    );

    setCompletedActivityIds((current) =>
      current.filter((id) => id !== activityId),
    );

    setBookedActivityIds((current) =>
      current.filter((id) => id !== activityId),
    );

    setOverrides((current) => {
      const { [activityId]: _removed, ...rest } = current;

      return rest;
    });
  }

  function updatePlace(activityId: string, patch: PlaceOverride) {
    setOverrides((current) => ({
      ...current,
      [activityId]: { ...current[activityId], ...patch },
    }));
  }

  return {
    activities,
    updatePlace,
    completedActivityIds,
    bookedActivityIds,
    addActivity,
    removeCustomActivity,
    toggleCompleted: (id: string) =>
      toggleId(setCompletedActivityIds, id),
    toggleBooked: (id: string) =>
      toggleId(setBookedActivityIds, id),
  };
}
