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
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

setupServiceWorker();

addEventListener("install", () => self.skipWaiting());

addEventListener("activate", () => self.clients.claim());

function matchBuilderApi(url: URL) {
  const isMatchthing =
    url.hostname.endsWith(".builder.io") || url.hostname === "builder.io";
  console.log("isMatchthing", isMatchthing, url.toString());
  return isMatchthing;
}

registerRoute(({ url }) => !matchBuilderApi(url), new StaleWhileRevalidate());
registerRoute(({ url }) => matchBuilderApi(url), new NetworkFirst());

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
