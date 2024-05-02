import {
  component$,
  useComputed$,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import { inlineTranslate } from "qwik-speak";
import { AppContext, BlockableCaches } from "~/app.ctx";

interface Props {
  render: QRL<() => JSX.Element>;
  blockMessage: string;
  downloadSizeMB: number;
}

export const SWCachingBlocker = component$((props: Props) => {
  const appContext = useContext(AppContext);

  const serviceWorkerAvailable = useSignal<boolean | null>(null);
  const serviceWorkerDidCache = useSignal<boolean | null>(null);

  const t = inlineTranslate();

  const cachingIsUnblocked = useComputed$(() =>
    appContext.unblockedCaches.includes(BlockableCaches.PID_ANALYZER),
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const broadcastChannel = new BroadcastChannel("service-worker");

    broadcastChannel.addEventListener("message", (event: any) => {
      const { type, payload } = event.data;

      if (type !== "PRECACHE_PID_ANALYZER_CHECK_RESULT") {
        return;
      }

      console.log("receive: PRECACHE_PID_ANALYZER_CHECK_RESULT", payload);
      serviceWorkerDidCache.value = payload as boolean;
    });
    
    console.log("send: PRECACHE_PID_ANALYZER_CHECK");
    broadcastChannel.postMessage({ type: "PRECACHE_PID_ANALYZER_CHECK" });
  });

  const showBlocker = useComputed$(() => {
    if (cachingIsUnblocked.value) {
      console.log("caching is unblocked, skipping blocker");
      return false;
    }

    if (serviceWorkerAvailable.value === false) {
      console.log("service worker not available, showing blocker");
      return true;
    }

    if (serviceWorkerDidCache.value === true) {
      console.log("service worker did cache, skipping blocker");
      return false;
    }

    return true;
  });

  const acceptButtonLabel = t("cachingBlocker.acceptButton.label", {
    downloadSizeMB: props.downloadSizeMB,
  });

  if (showBlocker.value) {
    return (
      <div class="alert">
        <p>{props.blockMessage}</p>
        <button
          class="button"
          data-show={showBlocker.value ? 'true' : 'false'}
          onClick$={() =>
            (appContext.unblockedCaches = [
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
