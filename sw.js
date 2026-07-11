// D-Shop PH Service Worker
const CACHE_NAME = 'dshop-ph-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/customer.html',
    '/rider.html',
    '/admin.html',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/appwrite@14.0.0'
];

// Install: Cache all files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('✅ D-Shop PH cached for offline use');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests (like Appwrite API calls)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version or fetch from network
            return response || fetch(event.request).then((networkResponse) => {
                // Cache new successful responses
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // If offline and not cached, show a fallback
            if (event.request.destination === 'document') {
                return caches.match('/index.html');
            }
        })
    );
});
