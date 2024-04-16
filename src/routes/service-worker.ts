/*
 * WHAT IS THIS FILE?
 *
 * The service-worker.ts file is used to have state of the art prefetching.
 * https://qwik.builder.io/qwikcity/prefetching/overview/
 *
 * Qwik uses a service worker to speed up your site and reduce latency, ie, not used in the traditional way of offline.
 * You can also use this file to add more functionality that runs in the service worker.
 */
import { setupServiceWorker } from "@builder.io/qwik-city/service-worker";
import { registerRoute } from "workbox-routing";
import { precacheAndRoute, addPlugins } from "workbox-precaching";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from "workbox-strategies";

const STATIC_ASSETS_MANIFESTS: typeof self.__WB_MANIFEST = [];
const PID_ANALYZER_DEPENDENCIES_MANIFESTS: typeof self.__WB_MANIFEST = [];
const cleanManifestPaths: string[] = [];

const PID_ANALYZER_DEPENDENCY_URL_PREFIX = "pid-analyer-dependencies/";

self.__WB_MANIFEST.forEach((manifest) => {
  const manifestUrl = typeof manifest === "string" ? manifest : manifest.url;

  cleanManifestPaths.push(manifestUrl);

  if (manifestUrl.startsWith(PID_ANALYZER_DEPENDENCY_URL_PREFIX)) {
    PID_ANALYZER_DEPENDENCIES_MANIFESTS.push(manifest);
    return;
  }

  STATIC_ASSETS_MANIFESTS.push(manifest);
});

const PRECACHING_LISTENER_CLIENTS: Client[] = [];

addEventListener("install", (event) => {
  (event as any).waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          console.log("deleting cache", cacheName);
          return caches.delete(cacheName);
        }),
      );
    }),
  );
  self.skipWaiting();
});

addEventListener("activate", () => {
  self.clients.claim();
});

function matchBuilderApi(url: URL) {
  return url.hostname.endsWith(".builder.io") || url.hostname === "builder.io";
}

const VERCEL_ANALYTICS_PATH = "/_vercel/insights/";
function matchVercelAnalytics(url: URL) {
  return url.pathname.startsWith(VERCEL_ANALYTICS_PATH);
}

function matchWellKnown(url: URL) {
  return url.pathname.startsWith("/.well-known/");
}

const VERCEL_DOMAIN = "vercel.com";
function matchVercelDomain(url: URL) {
  return url.hostname === VERCEL_DOMAIN;
}

function isDynmicRouteThatShouldBeCached(url: URL) {
  if (matchBuilderApi(url)) {
    return false;
  }

  if (matchVercelAnalytics(url)) {
    return false;
  }

  if (matchWellKnown(url)) {
    return false;
  }

  if (matchVercelDomain(url)) {
    return false;
  }

  // qwik build files are handled by setupServiceWorker()
  if (url.pathname.startsWith("/build/")) {
    return false;
  }

  let pathNameWithoutSlash = url.pathname;
  if (pathNameWithoutSlash.startsWith("/")) {
    pathNameWithoutSlash = pathNameWithoutSlash.slice(1);
  }

  if (cleanManifestPaths.includes(pathNameWithoutSlash)) {
    return false;
  }

  return true;
}

// cdn (builder.io) content
registerRoute(
  ({ url }) => matchBuilderApi(url),
  new NetworkFirst({
    cacheName: "builder.io",
  }),
);

// pid analyzer dependencies
registerRoute(
  ({ url }) => {
    return PID_ANALYZER_DEPENDENCIES_MANIFESTS.some((manifest) => {
      let manifestUrl = typeof manifest === "string" ? manifest : manifest.url;
      if (!manifestUrl.startsWith("/")) {
        manifestUrl = "/" + manifestUrl;
      }

      return url.pathname === manifestUrl;
    });
  },
  new CacheFirst({
    cacheName: "pid-analyzer-dependencies",
  }),
);

// html content
registerRoute(
  (options) => isDynmicRouteThatShouldBeCached(options.url),
  new StaleWhileRevalidate({
    cacheName: "dynamic",
  }),
);

async function sendToClients(eventType: string, payload?: any): Promise<void>;
async function sendToClients(
  clients: Array<Client>,
  eventType: string,
  payload?: any,
): Promise<void>;
async function sendToClients(
  eventTypeOrClients: string | Array<Client>,
  payloadOrEventType?: any,
  payloadOrNone?: any,
) {
  let clients: Array<Client> | undefined;
  let eventType: string = "";
  let payload: any | undefined = undefined;
  if (Array.isArray(eventTypeOrClients)) {
    clients = eventTypeOrClients;
    eventType = payloadOrEventType as string;
    payload = payloadOrNone;
  } else {
    clients = (await self.clients.matchAll()) as Client[];
    eventType = eventTypeOrClients as string;
    payload = payloadOrEventType as any;
  }

  clients.forEach((client) => {
    client.postMessage({ type: eventType, payload });
  });
}

const manifestSize = STATIC_ASSETS_MANIFESTS.length;
let precacheCount = 0;
let didSendInitialEvent = false;
addPlugins([
  {
    handlerDidComplete: async ({ error, event }) => {
      if (event.type !== "install") {
        return;
      }

      if (!didSendInitialEvent) {
        sendToClients(PRECACHING_LISTENER_CLIENTS, "PRECACHING_STARTED", {
          total: manifestSize,
          cached: 0,
        });
        didSendInitialEvent = true;
      }

      if (error) {
        sendToClients(PRECACHING_LISTENER_CLIENTS, "PRECACHING_ERROR", {
          error: error,
        });
        return;
      }

      precacheCount++;
      sendToClients(PRECACHING_LISTENER_CLIENTS, "PRECACHING_PROGRESS", {
        total: manifestSize,
        cached: precacheCount,
      });

      if (precacheCount >= manifestSize) {
        sendToClients(PRECACHING_LISTENER_CLIENTS, "PRECACHING_COMPLETE");
      }
    },
  },
]);

// static content
precacheAndRoute(STATIC_ASSETS_MANIFESTS);
setupServiceWorker();

function clearCaches() {
  caches.keys().then(function (names) {
    for (const name of names) caches.delete(name);
  });
}

// clear caches on message from window process
self.addEventListener("message", async (event) => {
  if (event.data.type === "CLEAR_CACHES") {
    clearCaches();
  }

  if (event.data.type === "ATTACH_LISTENER_PRECACHING") {
    PRECACHING_LISTENER_CLIENTS.push(event.source as Client);
  }

  if (event.data.type === "PRECACHE_PID_ANALYZER_CHECK") {
    const didCache = await checkDidCachePIDAnalyzerDependencies();
    sendToClients("PRECACHE_PID_ANALYZER_CHECK_RESULT", didCache);
  }
});

async function checkForPIDResourceInSingleCache(
  cacheName: string,
): Promise<boolean> {
  const cache = await self.caches.open(cacheName);
  const keys = await cache.keys();

  for (const key of keys) {
    const url = new URL(key.url);
    if (url.pathname.startsWith("/" + PID_ANALYZER_DEPENDENCY_URL_PREFIX)) {
      return true;
    }
  }

  return false;
}

async function checkDidCachePIDAnalyzerDependencies() {
  const cacheNames = await self.caches.keys();

  for (const cacheName of cacheNames) {
    const didCache = await checkForPIDResourceInSingleCache(cacheName);
    if (didCache) {
      return true;
    }
  }

  return false;
}

declare const self: ServiceWorkerGlobalScope;
