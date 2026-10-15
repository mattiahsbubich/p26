import type {
  ActivityType,
  RatingCategory,
} from '../types';

const categoryLabels: Record<ActivityType, string[]> = {
  monument: [
    'Bellezza',
    'Atmosfera',
    'Organizzazione',
    'Vista',
    'Ne è valsa la pena',
  ],

  museum: [
    'Collezioni',
    'Spazi',
    'Organizzazione',
    'Emozione',
    'Esperienza',
  ],

  garden: [
    'Bellezza',
    'Tranquillità',
    'Passeggiata',
    'Atmosfera',
  ],

  walk: [
    'Atmosfera',
    'Bellezza',
    'Piacevolezza',
    'Autenticità',
    'Esperienza',
  ],

  view: [
    'Vista',
    'Atmosfera',
    'Organizzazione',
    'Esperienza',
  ],

  food: [
    'Cibo',
    'Servizio',
    'Atmosfera',
    'Location',
    'Qualità/prezzo',
  ],

  shop: [
    'Atmosfera',
    'Scelta',
    'Prezzi',
    'Esperienza',
  ],

  logistics: [
    'Comodità',
    'Posizione',
    'Esperienza',
  ],

  custom: [
    'Divertimento',
    'Organizzazione',
    'Location',
    'Originalità',
    'Esperienza',
  ],
};

export function createRatingCategories(
  activityType: ActivityType,
): RatingCategory[] {
  return categoryLabels[activityType].map((label, index) => ({
    id: `${activityType}-${index}`,
    label,
    score: 7,
  }));
}
