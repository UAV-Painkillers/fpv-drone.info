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
import { useTranslation } from "~/translations.ctx";
import styles from "./pwa-install-banner.module.css";
import { useCSSTransition } from "qwik-transition";
import classNames from "classnames";

export const PWAInstallBanner = component$(() => {
  const installPromptEvent =
    useSignal<NoSerialize<{ prompt: () => Promise<any> } | null>>();
  const isOnline = useSignal(false);

  const showBanner = useComputed$(
    () => !!installPromptEvent.value && isOnline.value,
  );

  const { stage, shouldMount } = useCSSTransition(showBanner, {
    timeout: 1000,
  });

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

  const ariaButtonLabel = useTranslation(
    "pwa.install.button.ariaLabel",
  ) as string;
  const buttonlabel = useTranslation("pwa.install.button.label") as string;

  const bannerText = useTranslation("pwa.install.banner.text") as string;

  return (
    <>
      {shouldMount.value ? (
        <div
          class={classNames(styles.banner, {
            [styles.hidden]: stage.value !== "enterTo",
          })}
        >
          <span>{bannerText}</span>
          <button
            id="install"
            class="button"
            onClick$={onInstallButtonClick}
            aria-label={ariaButtonLabel}
          >
            {buttonlabel}
          </button>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
});
