import type { DayPlan } from '../types';

/*
 * L'itinerario originale. Le tappe possono essere modificate
 * dall'app; da qui si può sempre ripristinare un giorno.
 */
export const defaultPlans: DayPlan[] = [
  {
    date: '2026-10-31',
    items: [
      {
        id: 'd1-cdg',
        activityId: 'cdg',
        title: 'Arrivo a CDG',
        time: '10:30',
        note: 'Considerate tempo per sbarco, bagagli e trasferimento verso il 7° arrondissement.',
      },
      {
        id: 'd1-pranzo',
        title: 'Zona casa / pranzo',
        kind: 'meal',
        time: '12:30',
        note: 'Se l’host permette il deposito anticipato dei bagagli, lasciateli e fate un pranzo tranquillo nei dintorni.',
      },
      {
        id: 'd1-checkin',
        activityId: 'casa',
        title: 'Check-in',
        time: '15:00',
        note: 'Sistematevi e ripartite senza fretta.',
      },
      {
        id: 'd1-champs',
        activityId: 'champs-elysees',
        time: '16:00',
        note: 'Passeggiata via Pont de l’Alma / Avenue Montaigne verso il viale più famoso di Parigi.',
      },
      {
        id: 'd1-arc',
        activityId: 'arc-de-triomphe',
        time: '17:00',
        note: 'Salita panoramica. È una bellissima fascia oraria per vedere la città passare dal giorno alle luci della sera.',
      },
      {
        id: 'd1-trocadero',
        activityId: 'trocadero',
        title: 'Trocadéro + cena',
        time: '18:30',
        note: 'Scendete verso Trocadéro, fotografate la Torre Eiffel e cenate in zona.',
      },
      {
        id: 'd1-eiffel',
        activityId: 'tour-eiffel',
        time: '20:30',
        note: 'Salita serale: è il momento “wow” del viaggio. Dopo la visita siete a pochi minuti da casa.',
      },
    ],
  },
  {
    date: '2026-11-01',
    items: [
      {
        id: 'd2-partenza',
        title: 'Partenza da Parigi',
        kind: 'transport',
        time: '07:45',
        note: 'Puntate ad arrivare prima dell’apertura. Dal vostro quartiere il collegamento verso Versailles è comodo.',
      },
      {
        id: 'd2-palazzo',
        activityId: 'versailles',
        time: '09:00',
        note: 'Dedicate circa 2 ore agli Appartamenti Reali e alla Galleria degli Specchi.',
      },
      {
        id: 'd2-giardini',
        activityId: 'giardini-versailles',
        title: 'Giardini + pausa',
        time: '11:00',
        note: 'Passeggiata nei giardini e pranzo semplice, così da non perdere troppo tempo.',
      },
      {
        id: 'd2-trianon',
        activityId: 'trianon-hameau',
        time: '12:30',
        note: 'Grand/Petit Trianon e Hameau de la Reine: tenete scarpe comode, le distanze nel Domaine sono importanti.',
      },
      {
        id: 'd2-rientro',
        title: 'Rientro verso Parigi',
        kind: 'transport',
        time: '15:30',
        note: 'Rientro nel pomeriggio, così avete ancora energie e tempo per cambiare completamente atmosfera.',
      },
      {
        id: 'd2-montmartre',
        activityId: 'montmartre',
        time: '17:00',
        note: 'Abbesses → Mur des Je t’aime → Sacré-Cœur → Place du Tertre → Maison Rose → Moulin de la Galette → rue Lepic.',
      },
    ],
  },
  {
    date: '2026-11-02',
    items: [
      {
        id: 'd3-louvre',
        activityId: 'louvre',
        time: '09:00',
        note: 'Mattina dedicata al Louvre. Tenete circa 4 ore e scegliete prima 2-3 sezioni prioritarie.',
      },
      {
        id: 'd3-pranzo',
        title: 'Pranzo + spostamento',
        kind: 'meal',
        time: '13:00',
        note: 'Pranzo in zona Louvre / Palais Royal e poi spostamento con calma verso l’Opéra.',
      },
      {
        id: 'd3-garnier',
        activityId: 'palais-garnier',
        time: '15:00',
        note: 'Visita dell’Opéra: slot delle 15:00 (già prenotato).',
      },
      {
        id: 'd3-galeries',
        activityId: 'galeries-lafayette',
        time: '16:15',
        note: 'Coupole + terrazza panoramica: tappa breve ma con una bellissima vista sulla città.',
      },
      {
        id: 'd3-tuileries',
        activityId: 'tuileries',
        time: '18:00',
        note: 'Rientrate verso le Tuileries per una passeggiata fino a Place de la Concorde, prima della chiusura.',
      },
      {
        id: 'd3-cena',
        title: 'Cena / serata libera',
        kind: 'meal',
        time: '19:00',
        note: 'Montmartre è già stato fatto la sera prima: qui potete rallentare e scegliere una cena senza corse.',
      },
    ],
  },
  {
    date: '2026-11-03',
    items: [
      {
        id: 'd4-checkout',
        activityId: 'casa',
        title: 'Check-out / bagagli',
        time: '08:15',
        note: 'Il check-out è alle 11:00, ma uscire presto vi semplifica la giornata. Se possibile lasciate i bagagli all’host o in deposito.',
      },
      {
        id: 'd4-sainte-chapelle',
        activityId: 'sainte-chapelle',
        time: '09:00',
        note: 'Iniziate dalle vetrate, prima che aumenti il flusso di visitatori.',
      },
      {
        id: 'd4-notre-dame',
        activityId: 'notre-dame',
        time: '10:00',
        note: 'È vicinissima: spostamento a piedi e visita della cattedrale senza attraversare la città.',
      },
      {
        id: 'd4-luxembourg',
        activityId: 'luxembourg',
        time: '11:15',
        note: 'Passeggiata verso il Quartiere Latino e il giardino; fate almeno la Fontaine Médicis e il grande bacino centrale.',
      },
      {
        id: 'd4-pranzo',
        title: 'Pranzo',
        kind: 'meal',
        time: '12:15',
        note: 'Tenetelo abbastanza rapido per arrivare all’Orsay in orario.',
      },
      {
        id: 'd4-orsay',
        activityId: 'orsay',
        time: '13:15',
        note: 'Due ore mirate: Impressionisti, Van Gogh, Monet, Renoir, Degas. Meglio due ore ben scelte che saltarlo del tutto.',
      },
      {
        id: 'd4-stop',
        title: 'Stop visite · bagagli',
        kind: 'transport',
        time: '15:15',
        note: 'Recuperate i bagagli e dirigetevi verso la stazione.',
      },
      {
        id: 'd4-treno',
        title: 'In stazione · treno 18:15',
        kind: 'transport',
        time: '17:00',
        note: 'Target prudente: essere in stazione circa 1h15 prima della partenza. Da adattare quando avete la stazione esatta; poi niente sprint finale con le valigie.',
      },
    ],
  },
];

export function createDefaultPlan(date: string): DayPlan {
  const plan = defaultPlans.find((item) => item.date === date);

  return {
    date,
    items: plan ? plan.items.map((item) => ({ ...item })) : [],
  };
}
