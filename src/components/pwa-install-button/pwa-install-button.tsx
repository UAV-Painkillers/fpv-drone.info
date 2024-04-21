import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  noSerialize,
  useOnWindow,
  useSignal,
  $,
} from "@builder.io/qwik";
import { useTranslation } from "~/translations.ctx";

export const PWAInstallButton = component$(() => {
  const installPromptEvent =
    useSignal<NoSerialize<{ prompt: () => Promise<any> } | null>>();

  useOnWindow(
    "beforeinstallprompt",
    $((event) => {
      event.preventDefault();
      installPromptEvent.value = noSerialize(event as any);
    })
  );

  const onInstallButtonClick = $(async () => {
    if (!installPromptEvent.value) {
      return;
    }

    const installPrompt = installPromptEvent.value;
    await installPrompt.prompt();

    installPromptEvent.value = noSerialize(undefined);
  });

  const ariaLabel = useTranslation('pwa.installButton.ariaLabel') as string;
  const label = useTranslation('pwa.installButton.label') as string;

  return (
    <button
      id="install"
      class="button floating"
      hidden={!installPromptEvent.value}
      onClick$={onInstallButtonClick}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
});
