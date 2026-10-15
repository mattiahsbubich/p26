export type ActivityType =
  | 'monument'
  | 'museum'
  | 'garden'
  | 'walk'
  | 'view'
  | 'food'
  | 'shop'
  | 'logistics'
  | 'custom';

/*
 * required = biglietto/slot da prenotare
 * check    = da verificare (disponibilità, orari, regole)
 */
export type BookingStatus = 'required' | 'check';

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;

  /*
   * Le coordinate sono facoltative.
   * Se non sono presenti, il luogo non appare sulla mappa.
   */
  latitude?: number;
  longitude?: number;

  address?: string;
  description: string;
  practicalNote?: string;
  booking?: BookingStatus;

  /* Da non perdere assolutamente (mostrato come "Imperdibile"). */
  must?: boolean;
  custom?: boolean;
}

/*
 * Tipo di tappa "libera", cioè senza un luogo associato
 * (pranzo, spostamenti, ecc.).
 */
export type StopKind = 'meal' | 'transport' | 'lodging' | 'free';

/*
 * Una tappa del programma di un giorno.
 * - con activityId: è legata a un luogo (mappa, navigazione, pagelle);
 * - senza activityId: è una tappa libera, descritta da title.
 * title, se presente, sostituisce il nome del luogo.
 */
export interface PlanItem {
  id: string;
  activityId?: string;
  title?: string;
  kind?: StopKind;
  time?: string;
  note?: string;
  done?: boolean;
}

export interface DayPlan {
  date: string;
  items: PlanItem[];
}

export interface TripDayTip {
  title: string;
  text: string;
  tone: 'info' | 'warning' | 'good';
}

export interface TripDay {
  date: string;
  shortDay: string;
  dayNumber: string;
  fullLabel: string;
  zone: string;
  tagline: string;
  route: string;
  badge?: string;

  /* Colore della "linea" del giorno (stile métro). */
  lineColor: string;
  lineInk: string;

  tips: TripDayTip[];
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
