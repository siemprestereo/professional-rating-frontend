// Service Worker mínimo para habilitar instalación como PWA
// No cachea contenido offline (solo permite "Agregar a pantalla de inicio")

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar requests a la API ni cross-origin
  if (
    url.hostname !== self.location.hostname ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/oauth2/') ||
    url.pathname.startsWith('/login')
  ) {
    return; // dejar pasar sin interceptar
  }

  // Pass through para el resto
  event.respondWith(fetch(event.request));
});