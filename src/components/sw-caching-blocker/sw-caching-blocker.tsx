import {
  component$,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import { AppContext, BlockableCaches } from "~/app.ctx";
import { useTranslation } from "~/translations.ctx";

interface Props {
  render: QRL<() => JSX.Element>;
  blockMessage: string;
  downloadSizeMB: number;
}

export const SWCachingBlocker = component$((props: Props) => {
  const appContext = useContext(AppContext);

  const serviceWorkerAvailable = useSignal<boolean | null>(null);
  const serviceWorkerDidCache = useSignal<boolean | null>(null);

  const show = useComputed$(() =>
    appContext.unblockedCaches.includes(BlockableCaches.PID_ANALYZER)
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const serviceWorker = track(() => appContext.serviceWorker);

    if (!serviceWorker) {
      serviceWorkerAvailable.value = false;
      return;
    }

    serviceWorkerAvailable.value = true;

    navigator.serviceWorker.addEventListener("message", (event: any) => {
      const { type, payload } = event.data;

      if (type !== "PRECACHE_PID_ANALYZER_CHECK_RESULT") {
        return;
      }

      serviceWorkerDidCache.value = payload as boolean;
    });

    serviceWorker.postMessage({ type: "PRECACHE_PID_ANALYZER_CHECK" });
  });

  const showBlocker = useComputed$(() => {
    if (show.value) {
      return false;
    }

    if (serviceWorkerAvailable.value === false) {
      return true;
    }

    if (serviceWorkerDidCache.value === true) {
      return false;
    }

    return true;
  });

  const acceptButtonLabel = useTranslation("cachingBlocker.acceptButton.label", {
    downloadSizeMB: props.downloadSizeMB,
  });

  if (showBlocker.value) {
    return (
      <div class="alert">
        <p>{props.blockMessage}</p>
        <button
          class="button"
          onClick$={() =>
            (appContext.unblockedCaches = [
              ...(appContext.unblockedCaches ?? []),
              BlockableCaches.PID_ANALYZER,
            ])
          }
        >
          {acceptButtonLabel}
        </button>
      </div>
    );
  }

  return <>{props.render()}</>;
});
