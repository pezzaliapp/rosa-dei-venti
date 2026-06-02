// Service worker — funziona su GitHub Pages anche in sottocartella (percorsi relativi)
const CACHE = 'rosa-venti-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

// Install: cache resiliente — un file mancante NON blocca l'installazione
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(ASSETS.map(a => c.add(a).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Dati meteo/geocoding: sempre dalla rete (mai dalla cache)
  if (url.hostname.includes('open-meteo.com')) {
    e.respondWith(
      fetch(req).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // Risorse esterne (es. Google Fonts): rete, con fallback alla cache se presente
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // App shell (stesso dominio): cache-first, poi rete; fallback a index.html per le navigazioni
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    } catch (err) {
      if (req.mode === 'navigate') return caches.match('./index.html');
      throw err;
    }
  })());
});
