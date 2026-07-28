/**
 * Kill switch for the pre-rewrite service worker.
 *
 * The Qwik site registered its worker at /service-worker.js and precached
 * every prerendered page (Workbox precaching serves those cache-first), so
 * browsers that visited the old site keep rendering the old HTML from Cache
 * Storage and never load the new app — which means they never get around to
 * registering the current worker at /sw.js either.
 *
 * A registration is not dropped just because its script starts 404ing, so the
 * only channel left is the update check the browser makes for this exact URL
 * on every navigation. This file answers that check with a worker that has no
 * fetch handler, wipes Cache Storage, unregisters itself and reloads whatever
 * tabs it inherited. After that the browser goes to the network, gets the new
 * app, and the new app registers /sw.js.
 *
 * Keep this file until the old worker is gone from the wild. Removing it makes
 * /service-worker.js 404 again, which strands anyone who has not been back
 * since — the redeploy would silently re-open the trap for those users.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Take over the tabs the old worker was controlling so we can reload
      // them below.
      await self.clients.claim();

      // Drops the old precache ("static"), the old NetworkFirst cache
      // ("dynamic") and the old analyzer runtime, whose files lived under a
      // path the new app no longer uses.
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      await self.registration.unregister();

      const windows = await self.clients.matchAll({ type: 'window' });
      await Promise.all(
        windows.map(async (client) => {
          try {
            await client.navigate(client.url);
          } catch {
            // Best effort: a client we cannot navigate picks up the new app on
            // its next reload anyway, since nothing intercepts fetches now.
          }
        }),
      );
    })(),
  );
});
