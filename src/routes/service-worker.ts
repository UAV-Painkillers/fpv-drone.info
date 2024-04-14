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
import { precacheAndRoute } from "workbox-precaching";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

const STATIC_ASSETS_MANIFESTS = self.__WB_MANIFEST;
const cleanManifestPaths = STATIC_ASSETS_MANIFESTS.map((manifest) => {
  if (typeof manifest === "string") {
    return "/" + manifest;
  }

  return "/" + manifest.url;
});

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

  // tell window process that caches are cleared
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "CACHES_CLEARED" }));
  });
});

declare const self: ServiceWorkerGlobalScope;
