/*
 * Service-worker KILL SWITCH (2026-10-08).
 *
 * SpendXP no longer uses a service worker, but an earlier build registered
 * /sw.js in some browsers. Because that file stopped existing on the server,
 * browsers could never fetch an update, so the OLD worker kept serving stale
 * cached pages and the web app hung on the loading screen (confirmed: a
 * normal Chrome profile stuck while Incognito worked).
 *
 * Browsers re-check the worker script URL on every navigation. Serving this
 * file at the same URL replaces the old worker, which then deletes every
 * cache, unregisters itself, and reloads open tabs once.
 *
 * Safe to delete after a few months, once old registrations have expired.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // best effort
      }
      try {
        await self.registration.unregister();
      } catch (e) {
        // best effort
      }
      try {
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((c) => {
          if ('navigate' in c) c.navigate(c.url);
        });
      } catch (e) {
        // best effort
      }
    })()
  );
});

// Never intercept requests: always go to the network.
self.addEventListener('fetch', () => {});
