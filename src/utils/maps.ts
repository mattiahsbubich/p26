import type { Activity } from '../types';
import { STORAGE_KEYS, readStored } from './storage';

export type MapsProvider = 'apple' | 'google';
export type TravelMode = 'transit' | 'walking';

type Located = Activity & { latitude: number; longitude: number };

export function hasCoordinates(activity: Activity): activity is Located {
  return (
    typeof activity.latitude === 'number' &&
    typeof activity.longitude === 'number'
  );
}

export function getMapsProvider(): MapsProvider {
  return readStored(STORAGE_KEYS.mapsProvider) === 'google'
    ? 'google'
    : 'apple';
}

export function createViewUrl(activity: Activity): string | null {
  if (!hasCoordinates(activity)) {
    return null;
  }

  const { latitude, longitude, name } = activity;

  if (getMapsProvider() === 'google') {
    const params = new URLSearchParams({
      api: '1',
      query: `${latitude},${longitude}`,
    });

    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  const params = new URLSearchParams({
    ll: `${latitude},${longitude}`,
    q: name,
    z: '16',
  });

  return `https://maps.apple.com/?${params.toString()}`;
}

export function createDirectionsUrl(
  activity: Activity,
  mode: TravelMode,
): string | null {
  if (!hasCoordinates(activity)) {
    return null;
  }

  const destination = `${activity.latitude},${activity.longitude}`;

  if (getMapsProvider() === 'google') {
    const params = new URLSearchParams({
      api: '1',
      destination,
      travelmode: mode,
    });

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  const params = new URLSearchParams({
    daddr: destination,
    q: activity.name,
    dirflg: mode === 'transit' ? 'r' : 'w',
  });

  return `https://maps.apple.com/?${params.toString()}`;
}
