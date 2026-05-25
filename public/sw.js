const STATIC_CACHE = 'static-v92';
const RUNTIME_CACHE = 'runtime-v92';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
    OFFLINE_URL,
    // This will be injected at build or dynamically
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
    );
    self.skipWaiting();
  });
  

  self.addEventListener('activate', (event) => {
    const cacheWhitelist = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (!cacheWhitelist.includes(key)) return caches.delete(key);
          })
        )
      )
    );
    self.clients.claim();
  });

// self.addEventListener('fetch', (event) => {});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip caching for dynamic API/cart/checkout routes
  const isDynamic = [
    '/',
    '/api/',
    '/cart',
    '/checkout',
    '/products/',
    '/user/',
    '/account',
    '/admin/',
    '/login'
    // 1600
    // 800
  ].some(path => url.pathname.startsWith(path));

  if (isDynamic) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // ✅ Cache only static content
            return caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => {
            // Only fallback for HTML pages
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          })
      );
    })
  );
});
