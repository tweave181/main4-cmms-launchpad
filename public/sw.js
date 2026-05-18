
// Disable the legacy service worker cache.
// The previous implementation cached old non-Vite asset paths and could leave
// the app stuck on a blank screen when stale HTML/JS was served.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    await self.clients.claim();
  })());
});
