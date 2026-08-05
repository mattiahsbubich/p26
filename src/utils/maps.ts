import type { Activity } from '../types';

function hasCoordinates(
  activity: Activity,
): activity is Activity & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof activity.latitude === 'number' &&
    typeof activity.longitude === 'number'
  );
}

export function createAppleMapsViewUrl(
  activity: Activity,
): string | null {
  if (!hasCoordinates(activity)) {
    return null;
  }

  const params = new URLSearchParams({
    ll: `${activity.latitude},${activity.longitude}`,
    q: activity.name,
    z: '16',
  });

  return `https://maps.apple.com/?${params.toString()}`;
}

export function createAppleMapsDirectionsUrl(
  activity: Activity,
): string | null {
  if (!hasCoordinates(activity)) {
    return null;
  }

  const params = new URLSearchParams({
    daddr: `${activity.latitude},${activity.longitude}`,
    q: activity.name,
    dirflg: 'd',
  });

  return `https://maps.apple.com/?${params.toString()}`;
}