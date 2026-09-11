/* Shanghai Trip Room — service worker.
   Network-first on everything it handles, so the page is always the latest published version when
   there is signal; cache fallback so it still opens with no signal. Touches only the Shanghai files. */
const CACHE = 'shanghai-trip-room-v3';
const OWN = ['shanghai-september-2026.html','jingan-district.html','shanghai.webmanifest','shanghai-icon-192.png','shanghai-icon-512.png','shanghai-icon-180.png'];
const isOwn = (url) => { try { const p = new URL(url).pathname.split('/').pop(); return OWN.includes(p); } catch (e) { return false; } };
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(OWN.map((f) => './' + f))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('shanghai-trip-room-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !isOwn(e.request.url)) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).then((r) => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
