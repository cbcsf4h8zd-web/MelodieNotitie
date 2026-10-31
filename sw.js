/* MelodieNotitie offline: versie 3ce5bc31 */
const CACHE = "mn-3ce5bc31";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
const LIB = "https://cdn.jsdelivr.net/npm/abcjs@6.4.4/dist/abcjs-basic-min.js";
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => fetch(LIB, { mode: "no-cors" }).then(r => c.put(LIB, r)).catch(() => {}))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // andere apps in submappen (bijv. keukenboek/) met rust laten
  if (url.origin === location.origin) { const rest = url.pathname.slice(new URL(self.registration.scope).pathname.length); if (rest.includes("/")) return; }
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html");
  if (isPage) { // eerst internet (zodat updates binnenkomen), anders de bewaarde versie
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put("index.html", c)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (url.origin === location.origin || url.hostname.endsWith("jsdelivr.net") || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return r;
  }).catch(() => hit)));
});
