import { component$, $ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { storyblokEditable } from "@storyblok/js";
import { inlineTranslate } from "qwik-speak";

export const SWClearCacheButton = component$(() => {
  const t = inlineTranslate();

  const clearCache = $(() => {
    const sw = navigator.serviceWorker;

    const broadcastChannel = new BroadcastChannel("service-worker");
    broadcastChannel.addEventListener("message", async (event) => {
      if (event.data.type === "CACHES_CLEARED") {
        const registration = await sw.getRegistration();
        await registration?.unregister();

        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    });

    broadcastChannel.postMessage({ type: "CLEAR_CACHES" });
  });

  const ariaLabel = t("cache.clearAndReloadButton.label") as string;
  const label = t("cache.clearAndReloadButton.label") as string;

  return (
    <button class="button" onClick$={clearCache} aria-label={ariaLabel}>
      {label}
    </button>
  );
});

export const SWClearCacheButtonRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData) => {
    return <SWClearCacheButton {...storyblokEditable(storyData)} />;
  }),
  name: "SWClearCacheButton",
};
