import type { Itinerary } from '../types';

export const itineraries: Itinerary[] = [
  {
    id: 'arrival-adriatic',
    name: 'Arrivo e Baia dei Turchi',
    coast: 'adriatica',
    recommendedWinds: ['scirocco', 'ostro', 'variabile'],
    activityIds: ['baia-dei-turchi'],
    description:
      'Giornata leggera dopo l’arrivo a Brindisi, prima del check-in a Maglie.',
  },
  {
    id: 'adriatic-north',
    name: 'Adriatico Nord',
    coast: 'adriatica',
    recommendedWinds: ['scirocco', 'ostro'],
    activityIds: ['torre-dell-orso', 'torre-sant-andrea'],
    description:
      "Mattina a Torre dell’Orso e pomeriggio tra i faraglioni di Torre Sant’Andrea.",
  },
  {
    id: 'ionian-north',
    name: 'Ionio Nord',
    coast: 'ionica',
    recommendedWinds: ['tramontana', 'maestrale', 'grecale'],
    activityIds: ['punta-prosciutto', 'torre-lapillo', 'porto-cesareo'],
    description:
      'Partenza presto per Punta Prosciutto e rientro passando da Porto Cesareo.',
  },
  {
    id: 'ionian-south',
    name: 'Ionio Sud',
    coast: 'ionica',
    recommendedWinds: ['tramontana', 'maestrale', 'grecale'],
    activityIds: ['pescoluse', 'punta-della-suina'],
    description:
      'Mattina a Pescoluse e pomeriggio verso Punta della Suina.',
  },
];