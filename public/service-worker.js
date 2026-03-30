// =============================================
//  PISANTE NORDESTINO - service-worker.js
// =============================================

const CACHE_NAME = 'pisante-cache-v1';

const ARQUIVOS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json'
];

// INSTALAR — salva arquivos no cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache criado');
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting();
});

// ATIVAR — limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH — serve do cache, busca na rede se não encontrar
self.addEventListener('fetch', e => {
  // Não cachear chamadas de API
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        // Cachear nova resposta
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    }).catch(() => caches.match('/index.html'))
  );
});

