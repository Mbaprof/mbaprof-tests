// Minimal service worker - exists mainly to make the site installable as a
// PWA. It only caches static, unauthenticated assets (icons, manifest);
// every other request goes straight to the network, since this app is
// session/auth-driven and stale cached HTML would show the wrong user's
// data or an expired login state.
const CACHE_NAME = "mbaprof-tests-static-v1";
const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isPrecached = PRECACHE_URLS.includes(url.pathname);

  if (!isPrecached || event.request.method !== "GET") {
    return; // let the browser handle everything else normally
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
