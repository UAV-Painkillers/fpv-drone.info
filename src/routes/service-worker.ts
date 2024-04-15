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
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

const STATIC_ASSETS_MANIFESTS = self.__WB_MANIFEST;
const cleanManifestPaths = STATIC_ASSETS_MANIFESTS.map((manifest) => {
  if (typeof manifest === "string") {
    return "/" + manifest;
  }

  return "/" + manifest.url;
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

function isUncached(url: URL) {
  if (matchBuilderApi(url)) {
    return false;
  }

  // qwik build files are handled by setupServiceWorker()
  if (url.pathname.startsWith("/build/")) {
    return false;
  }

  if (cleanManifestPaths.includes(url.pathname)) {
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

// html content
registerRoute(
  (options) => isUncached(options.url),
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

  console.log("sending to clients", eventType, payload);

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
self.addEventListener("message", (event) => {
  if (event.data.type === "CLEAR_CACHES") {
    clearCaches();
  }

  if (event.data.type === "ATTACH_LISTENER_PRECACHING") {
    PRECACHING_LISTENER_CLIENTS.push(event.source as Client);
  }

  // tell window process that caches are cleared
  // sendToClients("CACHES_CLEARED");
});

declare const self: ServiceWorkerGlobalScope;
