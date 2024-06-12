import {
  addPlugins,
  precacheAndRoute,
  cleanupOutdatedCaches,
} from "workbox-precaching";
import { setDefaultHandler } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { setCacheNameDetails } from "workbox-core";

enum CACHE_NAMES {
  STATIC = "static",
  PID_ANALYZER = "pid-analyzer-dependencies",
  DYNAMIC = "dynamic",
}

setCacheNameDetails({
  prefix: "",
  precache: CACHE_NAMES.STATIC,
  suffix: "",
});

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

const broadcastChannel = new BroadcastChannel("service-worker");
broadcastChannel.addEventListener("message", (event) => {
  onClientMessage(event.data);
});

async function sendToClients(eventType: string, payload?: any): Promise<void> {
  broadcastChannel.postMessage({ type: eventType, payload });
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
        sendToClients("PRECACHING_STARTED", {
          total: manifestSize,
          cached: 0,
        });
        didSendInitialEvent = true;
      }

      if (error) {
        sendToClients("PRECACHING_ERROR", {
          error: error,
        });
        return;
      }

      precacheCount++;
      sendToClients("PRECACHING_PROGRESS", {
        total: manifestSize,
        cached: precacheCount,
      });

      if (precacheCount >= manifestSize) {
        sendToClients("PRECACHING_COMPLETE");

        console.debug("cleaning up outdated caches");
        cleanupOutdatedCaches();
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

async function onClientMessage(message: { type: string; payload: any }) {
  switch (message.type) {
    case "CLEAR_CACHES":
      clearCaches();
      break;
    case "PRECACHE_PID_ANALYZER_CHECK":
      const didCache = await checkDidCachePIDAnalyzerDependencies();
      sendToClients("PRECACHE_PID_ANALYZER_CHECK_RESULT", didCache);
      break;
  }
}

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

setDefaultHandler(new NetworkFirst({
  cacheName: CACHE_NAMES.DYNAMIC,
}));

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
  sendToClients("SERVICE_WORKER_ACTIVATED");
});

precacheAndRoute(STATIC_ASSETS_MANIFESTS);

declare const self: ServiceWorkerGlobalScope;
