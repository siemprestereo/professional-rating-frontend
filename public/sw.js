// Service Worker mínimo para habilitar instalación como PWA
// No cachea contenido offline (solo permite "Agregar a pantalla de inicio")

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through - no cache, solo permite instalación
  event.respondWith(fetch(event.request));
});