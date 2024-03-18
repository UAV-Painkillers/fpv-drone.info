import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  noSerialize,
  useOnWindow,
  useSignal,
  $,
} from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

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
    const result = await installPrompt.prompt();

    console.log(`Install prompt was: ${result.outcome}`);
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

export const PWAInstallButtonRegistryDefinition: RegisteredComponent = {
  component: PWAInstallButton,
  name: "PWAInstallButton",
  inputs: [],
};
