import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  /*
   * Per ora usiamo "/".
   * Prima del deployment GitHub Pages lo cambieremo in "/p26/".
   */
  base: '/p26/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'icons/apple-touch-icon.png',
        'icons/p26-icon-192.png',
        'icons/p26-icon-512.png',
      ],

      manifest: {
        name: 'Puglia 2026',
        short_name: 'P26',
        description:
          'Itinerario, attività, mappa e pagelle della vacanza in Puglia.',

        theme_color: '#0284c7',
        background_color: '#f0f9ff',

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
            src: 'icons/p26-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/p26-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/p26-icon-512.png',
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
          '**/*.{js,css,html,ico,png,svg,webp,json}',
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
             * Non garantisce una vera mappa offline,
             * ma conserva temporaneamente le tessere già viste.
             */
            urlPattern:
              /^https:\/\/.*\.tile\.openstreetmap\.org\/.*$/i,

            handler: 'CacheFirst',

            options: {
              cacheName: 'p26-map-tiles',

              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7,
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