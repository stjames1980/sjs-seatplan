/* SJS Seat Plan — offline cache. Change VERSION to publish an update. */
const VERSION = "sjs-seatplan-v2.1.0";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png", "favicon-32.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // network first for the page (gets updates), cache when offline; cache first for the rest
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put("index.html", cp)); return r; })
      .catch(() => caches.match("index.html", {ignoreSearch: true})));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request)));
});
