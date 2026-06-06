/* FoodSnap Service Worker — mínimo para tornar o app instalável (PWA).
   Não faz cache agressivo para evitar servir conteúdo desatualizado do Next.
   Estratégia: network-first com fallback ao cache só quando offline. */

const CACHE = 'foodsnap-runtime-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Só lida com GET de navegação/recursos do mesmo domínio
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        // guarda uma cópia para fallback offline
        if (fresh && fresh.status === 200 && new URL(req.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;
        throw err;
      }
    })()
  );
});
