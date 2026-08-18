const CACHE_NAME = 'game-of-opinions-pwa-v6';
const APP_SHELL = [
  '/',
  '/index.html',
  '/login.html',
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
  '/icon-192.png',
  '/icon-512.png'
]

// PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// Handles notifications that arrive while the app isn't in the foreground.
// See PUSH_NOTIFICATIONS_SETUP.md for how to send one from Firebase Console.
// Wrapped defensively - a messaging failure here must never break the
// install/activate/fetch handlers above that the whole PWA relies on.
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyBS3Fpobk342TpJw73mMgYOyUrWb-jBtfM",
    authDomain: "game-of-opinions-97b14.firebaseapp.com",
    projectId: "game-of-opinions-97b14",
    storageBucket: "game-of-opinions-97b14.firebasestorage.app",
    messagingSenderId: "863518863234",
    appId: "1:863518863234:web:3a2c2378a2a358e0b2299b"
  });

  const messaging = (typeof firebase.messaging.isSupported !== 'function' || firebase.messaging.isSupported())
    ? firebase.messaging()
    : null;

  if (messaging) {
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || 'Game of Opinions';
      const body = payload.notification?.body || '';
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: payload.fcmOptions?.link || payload.data?.url || '/index.html' }
      });
    });
  }
} catch (err) {
  console.warn('Push notification setup failed (caching still works fine):', err);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

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