import { component$, $ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";

export const SWClearCacheButton = component$(() => {
  const clearCache = $(() => {
    const sw = navigator.serviceWorker;

    sw.addEventListener("message", async (event) => {
      if (event.data.type === "CACHES_CLEARED") {
        const registration = await sw.getRegistration();
        await registration?.unregister();

        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    });

    sw.controller?.postMessage({ type: "CLEAR_CACHES" });
  });

  return (
    <button
      class="button"
      onClick$={clearCache}
      aria-label="Clear Cache and Reload Button"
    >
      Clear Cache and Reload
    </button>
  );
});

export const SWClearCacheButtonRegistryDefinition: CMSRegisteredComponent = {
  component: SWClearCacheButton,
  name: "SWClearCacheButton",
  friendlyName: "Service Worker Clear Cache Button",
  description: "Button to clear service worker cache and reload the page",
};
