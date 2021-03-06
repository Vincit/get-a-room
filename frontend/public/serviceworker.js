const CACHE_NAME = 'static-cache';
const urlsToCache = ['/index.html', '/offline.html'];

const self = this;

// Install the service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');

            return cache.addAll(urlsToCache);
        })
    );
});

// Listen for requests
self.addEventListener('fetch', (event) => {
    // We do not want to cache authenticated related resources because they are canceled anyway
    if (event.request.url.indexOf('/auth/') !== -1) {
        return false;
    }

    // Debug printing of URL:s that will be cached
    // console.log(event.request.url);

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return (
                response ||
                fetch(event.request).catch(() => caches.match('offline.html'))
            );
        })
    );
});

// Activate the service worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(CACHE_NAME);

    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                    return null;
                })
            )
        )
    );
});
