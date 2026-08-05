import type {
  ActivityType,
  RatingCategory,
} from '../types';

const categoryLabels: Record<ActivityType, string[]> = {
  beach: [
    'Mare',
    'Paesaggio',
    'Pulizia',
    'Comodità',
    'Tranquillità',
    'Qualità/prezzo',
  ],

  restaurant: [
    'Cibo',
    'Servizio',
    'Atmosfera',
    'Location',
    'Qualità/prezzo',
  ],

  city: [
    'Bellezza',
    'Atmosfera',
    'Cose da vedere',
    'Pulizia',
    'Vivibilità',
    'Esperienza',
  ],

  visit: [
    'Interesse',
    'Organizzazione',
    'Location',
    'Originalità',
    'Esperienza',
  ],

  walk: [
    'Paesaggio',
    'Piacevolezza',
    'Accessibilità',
    'Tranquillità',
    'Esperienza',
  ],

  parking: [
    'Posizione',
    'Comodità',
    'Sicurezza',
    'Qualità/prezzo',
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
    score: 6,
  }));
}