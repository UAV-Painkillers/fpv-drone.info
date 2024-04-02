import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  noSerialize,
  useOnWindow,
  useSignal,
  $,
} from "@builder.io/qwik";

export const PWAInstallButton = component$(() => {
  const installPromptEvent =
    useSignal<NoSerialize<{ prompt: () => Promise<any> } | null>>();
  useOnWindow(
    "beforeinstallprompt",
    $((event) => {
      event.preventDefault();
      installPromptEvent.value = noSerialize(event as any);
    }),
  );

  const onInstallButtonClick = $(async () => {
    if (!installPromptEvent.value) {
      return;
    }

    const installPrompt = installPromptEvent.value;
    await installPrompt.prompt();

    installPromptEvent.value = noSerialize(undefined);
  });

  return (
    <button
      id="install"
      class="button floating"
      hidden={!installPromptEvent.value}
      onClick$={onInstallButtonClick}
    >
      Install APP
    </button>
  );
});
