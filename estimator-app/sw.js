// Krueger Painting OS Service Worker (scoped to /estimator-app/)
const CACHE_PREFIX = 'krueger-os-estimator-cache-';
const CACHE_NAME = `${CACHE_PREFIX}v15`;
const PRECACHE_ASSETS = [
  '/estimator-app/',
  '/estimator-app/index.html',
  '/estimator-app/manifest.json',
  '/estimator-app/pwa-192x192.png',
  '/estimator-app/pwa-512x512.png',
  '/estimator-app/apple-touch-icon.png',
  '/estimator-app/favicon.png',
  '/estimator-app/icon-192.svg',
  '/estimator-app/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache same-origin GET requests under /estimator-app/
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/estimator-app/')) {
    return;
  }

  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    event.request.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/estimator-app/' ||
    url.pathname.endsWith('/index.html');

  // Network-first for HTML so deployed updates load immediately (with offline cache fallback)
  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/estimator-app/index.html'))
        )
    );
    return;
  }

  // Cache-first with background refresh for static icons/manifest assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
