import { component$, $ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { storyblokEditable } from "@storyblok/js";
import { useTranslation } from "~/translations.ctx";

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

  const ariaLabel = useTranslation(
    "cache.clearAndReloadButton.label",
  ) as string;
  const label = useTranslation("cache.clearAndReloadButton.label") as string;

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
