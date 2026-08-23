// Service Worker - גישת Network First: תמיד מנסה להביא גרסה טרייה מהרשת,
// ורק כשאין אינטרנט בכלל נופל חזרה לעותק השמור במטמון.
const CACHE_NAME = 'dorm-maintenance-v1';
const ASSETS = [
  './index.html',
  './manager.html',
  './manifest.json',
  './manifest-manager.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // לא נוגעים בבקשות ל-API של Apps Script - תמיד ישירות לרשת
  if (event.request.url.indexOf('script.google.com') !== -1) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
