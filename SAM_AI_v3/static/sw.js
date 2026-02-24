const CACHE_NAME = 'sam-ai-v3-cache-v6';

self.addEventListener('install', (event) => {
    // Skip waiting to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Delete ALL old caches (including v2 caches)
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Skip API requests
    if (event.request.url.includes('/api/')) {
        return;
    }
    // Network-first strategy: always try network, fallback to cache
    event.respondWith(
        fetch(event.request).then((response) => {
            if (response.ok && event.request.method === 'GET') {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then((cached) => {
                if (cached) return cached;
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
