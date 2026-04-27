// sw.ts — AcadTrak Service Worker
// يُدار بواسطة vite-plugin-pwa (Workbox injection point)

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

const serviceWorker = globalThis as typeof globalThis & {
  __WB_MANIFEST: unknown[];
  skipWaiting(): Promise<void>;
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<{ type?: string }>) => void,
  ): void;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Setup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
void serviceWorker.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Workbox يحقن قائمة الـ precache هنا تلقائياً
const precacheEntries = Array.isArray(serviceWorker.__WB_MANIFEST)
  ? (serviceWorker.__WB_MANIFEST as Array<string | { url: string; revision?: string }> )
  : [];

if (precacheEntries.length > 0) {
  precacheAndRoute(precacheEntries);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. API Calls — Network First (مع offline fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'acadtrak-api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 60 * 5, // 5 دقائق
      }),
    ],
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. الصور — Cache First (تدوم أسبوع)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'acadtrak-images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 أيام
      }),
    ],
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. Fonts — Cache First (تدوم سنة)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'acadtrak-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365, // سنة
      }),
    ],
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. JS/CSS Assets — Stale While Revalidate
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'acadtrak-assets-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. رسائل من الـ client (skip waiting)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
serviceWorker.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void serviceWorker.skipWaiting();
  }
});
