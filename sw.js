const CACHE = 'bac-media-club-v3';
const PRECACHE_URLS = [
  './',
  './index.html',
  './gallery.html',
  './videos.html',
  './events.html',
  './magazines.html',
  './css/styles.css',
  './css/gallery.css',
  './css/videos.css',
  './css/events.css',
  './css/magazines.css',
  './js/common.js',
  './js/script.js',
  './js/gallery.js',
  './js/videos.js',
  './js/events.js',
  './js/magazines.js',
  './data/gallery-manifest.js',
  './data/video-manifest.js',
  './data/magazine-manifest.js',
  './data/events.json',
  './manifest.json',
  './images/Media Club Logo.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only handle same-origin GET requests
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate for HTML, JS, CSS, JSON
  if (/\.(html|js|css|json)$/.test(url.pathname) || url.pathname === '/' || url.pathname === '') {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(e.request);
        const fetchPromise = fetch(e.request).then((response) => {
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cache-first for images and fonts
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
