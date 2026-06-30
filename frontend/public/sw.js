const CACHE_NAME = 'v1-asset-cache';
const TARGET_ASSET = '/mock-data/heavy-image.png';

// Service Worker installation lifecycle: instantly skip waiting state
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed.');
  self.skipWaiting();
});

// Service Worker activation lifecycle: claim clients immediately to start intercepting
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated.');
  event.waitUntil(self.clients.claim());
});

// Intercept requests and implement Cache-First, Network Fallback strategy
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Focus caching only on target mock assets to demonstrate latency difference
  if (requestUrl.pathname.endsWith(TARGET_ASSET)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[Service Worker] Serving cached resource: ${requestUrl.pathname}`);
          // Add custom header to indicate response source for the client frontend
          const responseHeaders = new Headers(cachedResponse.headers);
          responseHeaders.set('X-Source', 'Cache-Storage');
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: responseHeaders
          });
        }

        console.log(`[Service Worker] Resource not in cache. Fetching from network: ${requestUrl.pathname}`);
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clone response before caching since bodies can only be read once
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log(`[Service Worker] Resource cached successfully: ${requestUrl.pathname}`);
          });

          // Add custom header to indicate network source for the client frontend
          const responseHeaders = new Headers(networkResponse.headers);
          responseHeaders.set('X-Source', 'Network');
          return new Response(networkResponse.body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: responseHeaders
          });
        });
      })
    );
  }
});
