import type { ActivityType } from '../types';

export const activityTypeLabels: Record<ActivityType, string> = {
  monument: 'Monumento',
  museum: 'Museo',
  garden: 'Giardino',
  walk: 'Passeggiata',
  view: 'Panorama',
  food: 'Da mangiare',
  shop: 'Shopping',
  logistics: 'Logistica',
  custom: 'Altro',
};

/* Ordine in cui compaiono nei filtri e nei menu. */
export const activityTypeOrder: ActivityType[] = [
  'monument',
  'museum',
  'garden',
  'walk',
  'view',
  'food',
  'shop',
  'logistics',
  'custom',
];

/* Alloggio, aeroporto, ecc. non hanno una pagella. */
export function isRateable(type: ActivityType): boolean {
  return type !== 'logistics';
}
