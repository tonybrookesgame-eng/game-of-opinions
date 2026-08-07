const CACHE_NAME = 'game-of-opinions-pwa-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/admin.html',
  '/league.html',
  '/myxi.html',
  '/season.html',
  '/rules.html',
  '/signup.html',
  '/shared-fixtures.js',
  '/myxi-data-loader.js',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache each navigated page under its own URL, not always as
          // index.html - otherwise every page you visit overwrites the
          // index.html cache entry, and the offline fallback below can end
          // up serving the wrong page's content.
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});