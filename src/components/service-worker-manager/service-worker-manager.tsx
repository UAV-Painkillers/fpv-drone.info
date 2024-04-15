import {
  component$,
  useVisibleTask$,
  $,
  useStore,
  useComputed$,
} from "@builder.io/qwik";
import { useCSSTransition } from "qwik-transition";

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
    total: 55,
    cached: 23,
    cachingIsStarted: false,
    cachingIsDone: false,
  });
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
        case CACHING_EVENT.PRECACHING_PROGRESS:
          cachingStats.cachingIsStarted = true;
          cachingStats.total = payload!.total;
          cachingStats.cached = payload!.cached;
          break;

        case CACHING_EVENT.PRECACHING_COMPLETE:
          cachingStats.cachingIsDone = true;
          break;

        default:
          console.error("Unknown event type:", eventType);
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
    console.log("Service worker registered:", registration);

    const serviceWorker =
      registration.installing || registration.waiting || registration.active;
    if (!serviceWorker) {
      console.error("No service worker found");
      return;
    }
    serviceWorker.postMessage({ type: "ATTACH_LISTENER_PRECACHING" });

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
          class="button floating bottom"
          style={{
            transition: ".6s",
            bottom: stage.value === "enterTo" ? 0 : "-100%",
          }}
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
