import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/*
 * MapLibre 6 usa un worker ES che Vite non copia da solo nel build.
 * Lo pubblichiamo in <base>/maplibre/ (e lo serviamo anche in sviluppo);
 * la mappa lo carica con setWorkerUrl().
 */
const MAPLIBRE_WORKER = 'maplibre-gl-worker.mjs';

function maplibreWorker(): Plugin {
  const source = () =>
    readFileSync(`node_modules/maplibre-gl/dist/${MAPLIBRE_WORKER}`);

  return {
    name: 'maplibre-worker',

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: `maplibre/${MAPLIBRE_WORKER}`,
        source: source(),
      });
    },

    configureServer(server) {
      server.middlewares.use(
        `${server.config.base}maplibre/${MAPLIBRE_WORKER}`,
        (_request, response) => {
          response.setHeader('Content-Type', 'text/javascript');
          response.end(source());
        },
      );
    },
  };
}

export default defineConfig({
  /*
   * GitHub Pages pubblica il sito su https://<utente>.github.io/<repo>/.
   * Deve coincidere con il nome del repository (qui e in start_url/scope
   * più sotto).
   */
  base: '/p26/',

  plugins: [
    react(),

    maplibreWorker(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'icons/apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],

      manifest: {
        name: 'Parigi 2026',
        short_name: 'Parigi 26',
        description:
          'Itinerario, mappa, luoghi e pagelle del viaggio a Parigi.',

        theme_color: '#102f5e',
        background_color: '#f5f0e6',

        display: 'standalone',

        orientation: 'portrait',

        start_url: '/p26/',
        scope: '/p26/',

        lang: 'it',
        dir: 'ltr',

        categories: [
          'travel',
          'navigation',
          'lifestyle',
        ],

        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        /*
         * File generati da Vite da conservare offline.
         */
        globPatterns: [
          '**/*.{js,mjs,css,html,ico,png,svg,webp,json}',
        ],

        cleanupOutdatedCaches: true,

        clientsClaim: true,
        skipWaiting: true,

        /*
         * Se l'utente apre l'app offline,
         * viene restituito index.html.
         */
        navigateFallback: 'index.html',

        runtimeCaching: [
          {
            /*
             * Mappa vettoriale (stile, tessere, caratteri): quello che
             * avete già guardato resta disponibile anche senza rete.
             */
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*$/i,

            handler: 'StaleWhileRevalidate',

            options: {
              cacheName: 'paris26-map-vector',

              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            /*
             * Non garantisce una vera mappa offline, ma conserva
             * le tessere già viste (utile con la rete lenta in metro).
             */
            urlPattern:
              /^https:\/\/([a-c]\.)?tile\.openstreetmap\.org\/.*$/i,

            handler: 'CacheFirst',

            options: {
              cacheName: 'paris26-map-tiles',

              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        /*
         * Permette di provare la PWA anche con npm run dev.
         */
        enabled: true,
      },
    }),
  ],
});