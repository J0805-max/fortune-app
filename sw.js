const CACHE_NAME = "fortune-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/data.js",
  "js/notification.js",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "☀️ 今日运势";
  const body = data.body || "新的一天，来看看你的运势吧 🌿";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("./"));
});

