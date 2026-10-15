import type { TripDay } from '../types';

export const TRIP_NAME = 'Parigi 2026';
export const TRIP_DATES_LABEL = '31 ott – 3 nov 2026';
export const TRIP_START = '2026-10-31';

export const tripDays: TripDay[] = [
  {
    date: '2026-10-31',
    shortDay: 'Sab',
    dayNumber: '31',
    fullLabel: 'Sabato 31 ottobre',
    zone: 'Arrivo + Parigi ovest',
    tagline:
      'Un primo giorno bello ma non stressante, sfruttando la casa vicino alla Torre Eiffel.',
    route:
      'Casa → Champs-Élysées → Arc de Triomphe → Trocadéro → Tour Eiffel → Casa',
    badge: 'Arrivo',
    lineColor: '#6eca97',
    lineInk: '#0f2f20',
    tips: [
      {
        title: 'Perché funziona',
        text: 'Il 31 non avete prenotazioni mattutine da rischiare. Inoltre sfruttate al massimo la posizione dell’alloggio: la Torre Eiffel diventa la conclusione naturale della serata.',
        tone: 'good',
      },
    ],
  },
  {
    date: '2026-11-01',
    shortDay: 'Dom',
    dayNumber: '1',
    fullLabel: 'Domenica 1 novembre',
    zone: 'Versailles + Montmartre',
    tagline:
      'Versailles fino al pomeriggio, poi serata nel quartiere più bohémien.',
    route:
      'Parigi → Palazzo → Giardini → Trianon/Hameau → Parigi → Montmartre',
    lineColor: '#00814f',
    lineInk: '#ffffff',
    tips: [
      {
        title: 'Nota sul 1° novembre',
        text: 'Per questa data il calendario ufficiale di Versailles era poco chiaro. Avete già prenotato: ricontrollate apertura e orario del vostro slot il giorno prima e tenete a portata di mano la conferma.',
        tone: 'warning',
      },
      {
        title: 'Under 26',
        text: 'Avete entrambi 24 anni: portate sempre un documento. Per cittadini/residenti SEE molte attrazioni possono essere gratuite o ridotte, ma alcuni accessi, eventi o giardini possono richiedere un biglietto dedicato.',
        tone: 'info',
      },
    ],
  },
  {
    date: '2026-11-02',
    shortDay: 'Lun',
    dayNumber: '2',
    fullLabel: 'Lunedì 2 novembre',
    zone: 'Louvre, Opéra e Tuileries',
    tagline:
      'Il Louvre al mattino, poi il pomeriggio tra Opéra, Galeries Lafayette e Tuileries.',
    route: 'Louvre → Palais Garnier → Galeries Lafayette → Jardin des Tuileries',
    lineColor: '#ffbe00',
    lineInk: '#231a00',
    tips: [
      {
        title: 'Ordine del pomeriggio',
        text: 'Dopo il Louvre: pranzo, Palais Garnier alle 15:00, Galeries Lafayette e infine Tuileries. Così il museo ha la mattina migliore e il resto resta compatto.',
        tone: 'good',
      },
    ],
  },
  {
    date: '2026-11-03',
    shortDay: 'Mar',
    dayNumber: '3',
    fullLabel: 'Martedì 3 novembre',
    zone: 'Île de la Cité + Rive Gauche',
    tagline: 'Ultime visite senza compromettere il treno delle 18:15.',
    route:
      'Sainte-Chapelle → Notre-Dame → Jardin du Luxembourg → Musée d’Orsay → Bagagli → Stazione',
    badge: 'Partenza',
    lineColor: '#be418d',
    lineInk: '#ffffff',
    tips: [
      {
        title: 'Ultima regola del viaggio',
        text: 'Il 3 novembre niente aggiunte “al volo” dopo l’Orsay: il margine per bagagli e stazione vale più di un’ultima tappa fatta di corsa.',
        tone: 'warning',
      },
    ],
  },
];

export const bookingPriority: string[] = [
  'tour-eiffel',
  'versailles',
  'louvre',
  'palais-garnier',
  'sainte-chapelle',
  'orsay',
  'arc-de-triomphe',
];

export const packingList: Array<{ id: string; label: string }> = [
  { id: 'documento', label: 'Documento d’identità (per le agevolazioni under 26)' },
  { id: 'conferme', label: 'Conferme di prenotazione' },
  { id: 'scarpe', label: 'Scarpe comode' },
  { id: 'powerbank', label: 'Power bank' },
  { id: 'ombrello', label: 'Ombrello compatto' },
  { id: 'acqua', label: 'Piccola bottiglia d’acqua' },
];

export const infoCards: Array<{ title: string; text: string }> = [
  {
    title: 'Bagagli del 3 novembre',
    text: 'Chiedete all’host se può tenerli dopo il check-out. Se non è possibile, scegliete un deposito comodo rispetto alla stazione di partenza del treno.',
  },
  {
    title: 'Under 26',
    text: 'Avete 24 anni: controllate sempre la tariffa giovani e le condizioni specifiche. Per molte attrazioni la gratuità dipende anche da cittadinanza/residenza SEE.',
  },
  {
    title: 'Il principio dell’itinerario',
    text: 'Ogni giornata ha una zona dominante. Se qualcosa slitta, cercate di spostare solo tappe vicine tra loro invece di attraversare Parigi per “recuperare”.',
  },
];
