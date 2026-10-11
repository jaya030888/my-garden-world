// My Garden World — Safe Progressive Web App Service Worker
// Version: mgw-pwa-v1.0.1

const CACHE_NAME = 'mgw-app-shell-v1';

// Deliberate App Shell assets (explicitly excluding large AI models and dynamic APIs)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

// Domains and paths to NEVER cache in Service Worker
const EXCLUDE_URL_PATTERNS = [
  /\/api\//i,                         // All backend REST APIs (auth, sync, ledger)
  /huggingface\.co/i,                 // HuggingFace CDN (handled directly by @xenova/transformers Cache API)
  /cdn-lfs/i,                         // Large model file CDN
  /\.onnx$/i,                         // Raw neural model weights
  /\.onnx_data$/i,                    // External ONNX tensor data
  /chrome-extension/i,                // Extension schemas
  /vantage\.csw\.lenovo\.com/i        // External diagnostic domains
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith('mgw-')) {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Deliberate routing strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. Strict exclusion filter: Never cache authenticated APIs or external model weights
  for (const pattern of EXCLUDE_URL_PATTERNS) {
    if (pattern.test(url.href) || pattern.test(url.pathname)) {
      // Network-only passthrough
      return;
    }
  }

  // 3. Navigation Requests (HTML SPA routing for all paths e.g. /discover, /grow, /play, /garden)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: serve cached index.html so React Router & Dexie run offline
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) {
            return cachedIndex;
          }
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>My Garden World — Offline</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;background:#020617;color:#fff;"><h1>🌿 My Garden World is Offline</h1><p>Check your connection or revisit previously loaded sections.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 4. Static assets (JS chunks, CSS, fonts, SVG/PNG illustrations)
  const isStaticAsset = (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
     url.pathname.startsWith('/icons/') ||
     url.pathname.endsWith('.svg') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.js'))
  ) || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache, optionally revalidate in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {
            // Ignore background revalidation failure when offline
          });
          return cachedResponse;
        }

        // Cache miss: fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Message Listener for update prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
