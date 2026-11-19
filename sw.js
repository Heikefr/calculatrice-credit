// Crédit Immo : cache hors ligne. Change la version à chaque mise à jour du site.
const CACHE = 'credit-immo-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Répond tout de suite avec le cache, puis met à jour le cache en fond quand il y a du réseau.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const key = e.request.mode === 'navigate' ? 'index.html' : e.request;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(key, { ignoreSearch: true }).then(cached => {
        const net = fetch(e.request)
          .then(res => { if (res.ok) cache.put(key, res.clone()); return res; })
          .catch(() => cached);
        return cached || net;
      })
    )
  );
});
