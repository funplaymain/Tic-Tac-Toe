const cacheName = 'tic-tac-toe-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/script.js',
  '/icons/icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
