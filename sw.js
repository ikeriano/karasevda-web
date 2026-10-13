// Sin conexión: primero la red, y si no hay, lo guardado en caché
const C = 'ks-1.4';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET' || e.request.headers.get('range')) return;
  e.respondWith(fetch(e.request).then(n => { if (n.ok) { const c = n.clone(); caches.open(C).then(x => x.put(e.request, c)); } return n; }).catch(() => caches.match(e.request))); });
