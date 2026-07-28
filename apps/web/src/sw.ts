/// <reference lib="webworker" />
/**
 * Service worker (port of the original Workbox SW, simplified):
 * - precaches the app shell + prerendered pages (injected by build-sw script)
 * - the ~90 MB analyzer runtime is NOT precached; it lands in a dedicated
 *   CacheFirst cache as it streams through on first use, and can be
 *   prefetched explicitly via the PRECACHE_PID_ANALYZER_START message
 * - talks to clients over the "service-worker" BroadcastChannel
 *   (same protocol as before: PRECACHE_PID_ANALYZER_CHECK / _START,
 *   CLEAR_CACHES)
 */
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setDefaultHandler } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const DEPS_CACHE = 'pid-analyzer-dependencies';
const DEPS_PREFIX = '/pid-analyzer-dependencies/';
const DEPS_MANIFEST_URL = '/analyzer-deps-manifest.json';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// analyzer runtime: cache-first, populated on first (online) use
registerRoute(
  ({ url }) => url.pathname.startsWith(DEPS_PREFIX),
  new CacheFirst({ cacheName: DEPS_CACHE }),
);

// everything else: network first with cache fallback for offline
setDefaultHandler(new NetworkFirst({ cacheName: 'dynamic' }));

/* ------------------------- client communication ------------------------- */

interface DepsManifest {
  files: Array<{ url: string; size: number }>;
  totalBytes: number;
}

const channel = new BroadcastChannel('service-worker');

function send(type: string, payload?: unknown) {
  channel.postMessage({ type, payload });
}

async function getDepsManifest(): Promise<DepsManifest> {
  const res = await fetch(DEPS_MANIFEST_URL);
  return (await res.json()) as DepsManifest;
}

async function missingDepFiles(): Promise<{
  missing: DepsManifest['files'];
  total: number;
}> {
  const manifest = await getDepsManifest();
  const cache = await self.caches.open(DEPS_CACHE);
  const keys = await cache.keys();
  const cachedPaths = new Set(keys.map((req) => new URL(req.url).pathname));
  const missing = manifest.files.filter((f) => !cachedPaths.has(f.url));
  return { missing, total: manifest.files.length };
}

async function checkDepsCached() {
  try {
    const { missing, total } = await missingDepFiles();
    send('PRECACHE_PID_ANALYZER_CHECK_RESULT', {
      cached: missing.length === 0,
      missing: missing.length,
      total,
    });
  } catch (e) {
    send('PRECACHE_PID_ANALYZER_CHECK_RESULT', {
      cached: false,
      error: String(e),
    });
  }
}

async function precacheDeps() {
  try {
    const { missing, total } = await missingDepFiles();
    const cache = await self.caches.open(DEPS_CACHE);
    let done = total - missing.length;
    send('PRECACHE_PID_ANALYZER_PROGRESS', { cached: done, total });
    for (const file of missing) {
      await cache.add(file.url);
      done++;
      send('PRECACHE_PID_ANALYZER_PROGRESS', { cached: done, total });
    }
    send('PRECACHE_PID_ANALYZER_COMPLETE');
  } catch (e) {
    send('PRECACHE_PID_ANALYZER_ERROR', { error: String(e) });
  }
}

async function clearCaches() {
  const names = await self.caches.keys();
  await Promise.all(names.map((name) => self.caches.delete(name)));
  send('CACHES_CLEARED');
}

channel.addEventListener('message', (event) => {
  const message = event.data as { type?: string } | undefined;
  switch (message?.type) {
    case 'CLEAR_CACHES':
      void clearCaches();
      break;
    case 'PRECACHE_PID_ANALYZER_CHECK':
      void checkDepsCached();
      break;
    case 'PRECACHE_PID_ANALYZER_START':
      void precacheDeps();
      break;
  }
});
