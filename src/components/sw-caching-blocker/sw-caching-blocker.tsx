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

interface Props {
  render: QRL<() => JSX.Element>;
}

export const SWCachingBlocker = component$((props: Props) => {
  const appContext = useContext(AppContext);
  const serviceWorkerAvailable = useSignal<boolean | null>(null);
  const serviceWorkerDidCache = useSignal<boolean | null>(null);

  const show = useComputed$(() =>
    appContext.unblockedCaches.includes(BlockableCaches.PID_ANALYZER),
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

  const downloadSizeMb = 150;

  if (showBlocker.value) {
    return (
      <div class="alert">
        <p>
          In order to use the Tuning Tools Analyzer, you need to download and
          cache the actual analyzer. The files are about {downloadSizeMb}MB in
          size, if you are currently on a limited data plan, please be aware of
          this.
        </p>
        <button
          class="button"
          onClick$={() =>
            appContext.unblockedCaches.push(BlockableCaches.PID_ANALYZER)
          }
        >
          I understand, please download {downloadSizeMb}MB
        </button>
      </div>
    );
  }

  return <>{props.render()}</>;
});
