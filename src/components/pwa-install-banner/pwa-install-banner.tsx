import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  noSerialize,
  useOnWindow,
  useSignal,
  $,
  useVisibleTask$,
  useComputed$,
} from "@builder.io/qwik";
import { Banner } from "../shared/banner/banner";
import { inlineTranslate } from "qwik-speak";

export const PWAInstallBanner = component$(() => {
  const installPromptEvent =
    useSignal<NoSerialize<{ prompt: () => Promise<any> } | null>>();
  const isOnline = useSignal(false);

  const t = inlineTranslate();

  const showBanner = useComputed$(
    () => !!installPromptEvent.value && isOnline.value,
  );

  /**
   * Listen to online/offline events and update the `isOnline` signal.
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    isOnline.value = navigator.onLine;

    const onlineHandler = () => {
      isOnline.value = true;
    };

    const offlineHandler = () => {
      isOnline.value = false;
    };

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    cleanup(() => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    });
  });

  /**
   * Listen to the `beforeinstallprompt` event and prevent the default behavior.
   */
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

  const ariaButtonLabel = t("pwa.install.button.ariaLabel") as string;
  const buttonlabel = t("pwa.install.button.label") as string;

  const bannerText = t("pwa.install.banner.text") as string;

  return (
    <Banner show={showBanner} variant="success">
      <span>{bannerText}</span>
      <button
        id="install"
        class="button"
        onClick$={onInstallButtonClick}
        aria-label={ariaButtonLabel}
      >
        {buttonlabel}
      </button>
    </Banner>
  );
});
