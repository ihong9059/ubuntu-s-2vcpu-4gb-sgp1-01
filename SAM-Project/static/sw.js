// SKZ AI - Service Worker (Network-first strategy)
const CACHE_NAME = 'skz-ai-v2';
const STATIC_ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/css/markdown.css',
    '/static/lib/marked.min.js',
    '/static/lib/highlight.min.js',
    '/static/lib/highlight.min.css',
    '/static/js/api.js',
    '/static/js/app.js',
    '/static/js/chat.js',
    '/static/js/conversations.js',
    '/static/js/markdown.js',
    '/static/js/members.js',
    '/static/js/voice.js',
    '/static/js/news.js',
    '/static/js/settings.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Skip API calls
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then(resp => {
                const clone = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return resp;
            })
            .catch(() => caches.match(event.request))
    );
});
