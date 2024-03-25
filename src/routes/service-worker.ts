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

registerRoute(
  ({ url }) => url.hostname !== "cdn.builder.io",
  new StaleWhileRevalidate({
    plugins: [
      {
        cacheWillUpdate: async (params: any) => {
          console.log("cacheWillUpdate", params);
        },
        cacheDidUpdate: async (params: any) => {
          console.log("cacheDidUpdate", params);
        },
        fetchDidFail: async (params: any) => {
          console.log("fetchDidFail", params);
        },
      },
    ],
  })
);
registerRoute(
  ({ url }) => url.hostname === "cdn.builder.io",
  new NetworkFirst()
);

declare const self: ServiceWorkerGlobalScope;
