var CACHE = 'ez-interval-timer-v1';

var ASSETS = [
  '/ez-interval-timer/',
  '/ez-interval-timer/index.html',
  '/ez-interval-timer/css/style.css',
  '/ez-interval-timer/js/app.js',
  '/ez-interval-timer/js/audio.js',
  '/ez-interval-timer/js/confetti.js',
  '/ez-interval-timer/js/i18n.js',
  '/ez-interval-timer/js/records.js',
  '/ez-interval-timer/js/state.js',
  '/ez-interval-timer/js/storage.js',
  '/ez-interval-timer/js/timer.js',
  '/ez-interval-timer/js/ui.js',
  '/ez-interval-timer/manifest.json',
  '/ez-interval-timer/icon-192.png',
  '/ez-interval-timer/icon-512.png',
  '/ez-interval-timer/img/dicaprio-meme.gif',
  '/ez-interval-timer/img/party-popper-DEL.gif'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
