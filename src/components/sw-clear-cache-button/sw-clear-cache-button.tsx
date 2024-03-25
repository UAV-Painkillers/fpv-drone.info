import { component$, $ } from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

export const SWClearCacheButton = component$(() => {
  const clearCache = $(() => {
    const sw = navigator.serviceWorker;

    sw.addEventListener("message", async (event) => {
      if (event.data.type === "CACHES_CLEARED") {
        const registration = await sw.getRegistration();
        await registration?.unregister();
        location.reload();
      }
    });

    sw.controller?.postMessage({ type: "CLEAR_CACHES" });
  });

  return (
    <button class="button" onClick$={clearCache}>
      Clear Cache and Reload
    </button>
  );
});

export const SWClearCacheButtonRegistryDefinition: RegisteredComponent = {
  component: SWClearCacheButton,
  name: "SWClearCacheButton",
  friendlyName: "Service Worker Clear Cache Button",
  description: "Button to clear service worker cache and reload the page",
};
