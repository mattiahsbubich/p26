# Parigi 2026

Web app (PWA) per il viaggio a Parigi, 31 ottobre – 3 novembre 2026:
programma giorno per giorno modificabile, mappa con il percorso del giorno,
elenco dei luoghi con biglietti da prenotare e pagelle.

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:5173/p26/
npm run build
```

## Dove modificare i dati

- `src/data/activities.ts` – i luoghi (coordinate, note, biglietti)
- `src/data/defaultPlans.ts` – l'itinerario originale di ogni giorno
- `src/data/trip.ts` – giorni, colori, riquadri informativi, checklist

La mappa è vettoriale (MapLibre + OpenFreeMap, dati OpenStreetMap), ricolorata in
`src/utils/mapStyle.ts`; il worker di MapLibre viene copiato in `dist/maplibre/` da `vite.config.ts`.

Le modifiche fatte dall'app (ordine, tappe tolte/aggiunte, spunte, pagelle)
sono salvate nel `localStorage` del telefono con prefisso `paris26-`.

## Deploy su GitHub Pages

`base` in `vite.config.ts` è `/p26/`: deve coincidere con il nome del
repository. Poi: repository → Settings → Pages → Source: *GitHub Actions*;
il workflow in `.github/workflows/deploy.yml` pubblica a ogni push su `main`.
