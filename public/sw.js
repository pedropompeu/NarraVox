const CACHE = "narravox-v1";

const PRECACHE = [
  "/",
  "/privacidade",
  "/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Nunca intercepta chamadas à API TTS — precisam ir à rede sempre
  if (e.request.url.includes("/api/")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // Cacheia apenas GET de mesma origem com status OK
        if (
          e.request.method === "GET" &&
          e.request.url.startsWith(self.location.origin) &&
          res.status === 200
        ) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached ?? new Response("Offline", { status: 503 }));
    })
  );
});
