import {
  component$,
  useVisibleTask$,
  $,
  useStore,
  useComputed$,
  useSignal,
  noSerialize,
  useContext,
} from "@builder.io/qwik";
import type { NoSerialize } from "@builder.io/qwik";
import classNames from "classnames";
import { useCSSTransition } from "qwik-transition";
import { AppContext } from "~/app.ctx";

enum CACHING_EVENT {
  PRECACHING_STARTED = "PRECACHING_STARTED",
  PRECACHING_PROGRESS = "PRECACHING_PROGRESS",
  PRECACHING_COMPLETE = "PRECACHING_COMPLETE",
}

type CACHING_EVENT_PAYLOAD_MAP = {
  [CACHING_EVENT.PRECACHING_STARTED]: {
    total: number;
    cached: number;
  };
  [CACHING_EVENT.PRECACHING_PROGRESS]: {
    total: number;
    cached: number;
  };
  [CACHING_EVENT.PRECACHING_COMPLETE]: undefined;
};

export const ServiceWorkerManager = component$(() => {
  const cachingStats = useStore({
    total: 0,
    cached: 0,
    cachingIsStarted: false,
    cachingIsDone: false,
  });
  const serviceWorker = useSignal<NoSerialize<ServiceWorker | undefined>>(
    noSerialize(undefined),
  );
  const appContext = useContext(AppContext);

  const showBanner = useComputed$(
    () => cachingStats.cachingIsStarted && !cachingStats.cachingIsDone,
  );
  const { stage, shouldMount } = useCSSTransition(showBanner, { timeout: 300 });

  const handleEvent = $(
    <TEventType extends CACHING_EVENT>(
      eventType: TEventType | string,
      payload: CACHING_EVENT_PAYLOAD_MAP[TEventType],
    ) => {
      switch (eventType) {
        case CACHING_EVENT.PRECACHING_STARTED:
        case CACHING_EVENT.PRECACHING_PROGRESS: {
          const p =
            payload as CACHING_EVENT_PAYLOAD_MAP[CACHING_EVENT.PRECACHING_STARTED];
          cachingStats.cachingIsStarted = true;
          cachingStats.total = p.total;
          cachingStats.cached = p.cached;
          break;
        }

        case CACHING_EVENT.PRECACHING_COMPLETE:
          cachingStats.cachingIsDone = true;
          serviceWorker.value?.postMessage({
            type: "PRECACHE_PID_ANALYZER_CHECK",
          });
          break;

        default:
          console.error("Unknown event type:", eventType, payload);
      }
    },
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.error("Service worker not supported");
      return;
    }

    const registration =
      await navigator.serviceWorker.register("/service-worker.js");

    serviceWorker.value = noSerialize(
      registration.installing ||
        registration.waiting ||
        registration.active ||
        undefined,
    );

    appContext.serviceWorker = noSerialize(serviceWorker.value);

    if (!serviceWorker.value) {
      console.error("No service worker found");
      return;
    }

    serviceWorker.value.postMessage({ type: "ATTACH_LISTENER_PRECACHING" });

    navigator.serviceWorker.addEventListener("message", (event: any): void => {
      try {
        const { type, payload } = event.data;

        handleEvent(type, payload);
      } catch (e) {
        console.error("Failed to parse event data:", event);
      }
    });
  });

  const completedPercentage = useComputed$(() => {
    return Math.round((cachingStats.cached / cachingStats.total) * 100);
  });

  return (
    <>
      {/* for whatever reason, this is needed in order for anything to be rendered... */}
      <div></div>
      {shouldMount.value && (
        <div
          class={classNames("button floating bottom", {
            closed: stage.value !== "enterTo",
          })}
        >
          <p>
            <b>Updating App-Cache for offline usage.</b>
            <br />
            <small>Navigations might be slow during this process...</small>
          </p>
          <div>
            {/* show percentage of completion */}
            {completedPercentage}% completed
          </div>
        </div>
      )}
    </>
  );
});
