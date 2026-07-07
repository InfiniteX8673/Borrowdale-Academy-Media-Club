const CACHE = 'bac-media-club-v1';
const URLS = [
  '/',
  '/index.html',
  '/gallery.html',
  '/events.html',
  '/magazines.html',
  '/css/styles.css',
  '/css/gallery.css',
  '/css/events.css',
  '/css/magazines.css',
  '/js/script.js',
  '/js/gallery.js',
  '/js/events.js',
  '/js/magazines.js',
  '/data/gallery-manifest.js',
  '/data/magazine-manifest.js',
  '/data/events.json',
  '/manifest.json',
  '/images/Media Club Logo.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
