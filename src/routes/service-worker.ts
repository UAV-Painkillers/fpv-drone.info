import { precacheAndRoute, addPlugins } from "workbox-precaching";
import { setDefaultHandler } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

enum CACHE_NAMES {
  PID_ANALYZER = "pid-analyzer-dependencies",
  DYNAMIC = "dynamic",
}

const STATIC_ASSETS_MANIFESTS: typeof self.__WB_MANIFEST = [];
const PID_ANALYZER_DEPENDENCIES_MANIFESTS: typeof self.__WB_MANIFEST = [];

const PID_ANALYZER_DEPENDENCY_URL_PREFIX = "pid-analyer-dependencies/";
const API_URL_PREFIX = "api/";

self.__WB_MANIFEST.forEach((manifest) => {
  const manifestUrl = typeof manifest === "string" ? manifest : manifest.url;

  if (manifestUrl.startsWith(PID_ANALYZER_DEPENDENCY_URL_PREFIX)) {
    PID_ANALYZER_DEPENDENCIES_MANIFESTS.push(manifest);
    return;
  }

  if (manifestUrl.startsWith(API_URL_PREFIX)) {
    return;
  }

  if (manifestUrl === "index.html") {
    STATIC_ASSETS_MANIFESTS.push(
      typeof manifest === "string"
        ? "/"
        : {
            revision: manifest.revision,
            url: "/",
          },
    );
  }

  if (manifestUrl.endsWith("/index.html")) {
    const urlWithoutIndex = manifestUrl.replace("/index.html", "");
    STATIC_ASSETS_MANIFESTS.push(
      typeof manifest === "string"
        ? urlWithoutIndex
        : {
            revision: manifest.revision,
            url: urlWithoutIndex,
          },
    );
  }

  STATIC_ASSETS_MANIFESTS.push(manifest);
});

const PRECACHING_LISTENER_CLIENTS: Client[] = [];

addEventListener("install", (event) => {
  (event as any).waitUntil(clearCaches(CACHE_NAMES.PID_ANALYZER));
  self.skipWaiting();
});

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

async function clearCaches(...cachesToKeep: string[]) {
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    if (cachesToKeep.includes(name)) {
      continue;
    }

    console.debug("deleting cache", name);
    caches.delete(name);
  }
  sendToClients("CACHES_CLEARED");
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

precacheAndRoute(STATIC_ASSETS_MANIFESTS);
setDefaultHandler(
  new NetworkFirst({
    cacheName: CACHE_NAMES.DYNAMIC,
  }),
);
// registerRoute(new NavigationRoute(createHandlerBoundToURL("/")));

declare const self: ServiceWorkerGlobalScope;
