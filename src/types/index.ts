export type Coast = 'adriatica' | 'ionica' | 'interna';

export type Wind =
  | 'tramontana'
  | 'maestrale'
  | 'grecale'
  | 'scirocco'
  | 'ostro'
  | 'variabile';

export type ActivityType =
  | 'beach'
  | 'restaurant'
  | 'city'
  | 'visit'
  | 'walk'
  | 'parking'
  | 'custom';

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  coast?: Coast;
  recommendedWinds?: Wind[];

  /*
   * Le coordinate sono facoltative.
   * Se non sono presenti, l'attività non appare sulla mappa.
   */
  latitude?: number;
  longitude?: number;

  address?: string;
  description: string;
  practicalNote?: string;
  custom?: boolean;
}

export interface Itinerary {
  id: string;
  name: string;
  coast: Coast;
  recommendedWinds: Wind[];
  activityIds: string[];
  description: string;
}

export interface DayPlan {
  date: string;
  selectedWind: Wind;
  activityIds: string[];
}

export interface RatingCategory {
  id: string;
  label: string;
  score: number;
}

export interface ActivityReview {
  id: string;
  activityId: string;
  visitedAt: string;
  categories: RatingCategory[];
  note: string;
}