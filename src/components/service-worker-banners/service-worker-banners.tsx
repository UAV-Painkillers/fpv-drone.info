import {
  component$,
  $,
  useStore,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Banner } from "../banner/banner";

enum SW_EVENT {
  PRECACHING_STARTED = "PRECACHING_STARTED",
  PRECACHING_PROGRESS = "PRECACHING_PROGRESS",
  PRECACHING_COMPLETE = "PRECACHING_COMPLETE",
  SERVICE_WORKER_ACTIVATED = "SERVICE_WORKER_ACTIVATED",
}

type CACHING_EVENT_PAYLOAD_MAP = {
  [SW_EVENT.PRECACHING_STARTED]: {
    total: number;
    cached: number;
  };
  [SW_EVENT.PRECACHING_PROGRESS]: {
    total: number;
    cached: number;
  };
  [SW_EVENT.PRECACHING_COMPLETE]: undefined;
  [SW_EVENT.SERVICE_WORKER_ACTIVATED]: undefined;
};

export const ServiceWorkerBanners = component$(() => {
  const cachingStats = useStore({
    total: 0,
    cached: 0,
    cachingIsStarted: false,
    cachingIsDone: false,
  });
  
  const showCachingProgressBanner = useComputed$(
    () => cachingStats.cachingIsStarted && !cachingStats.cachingIsDone
  );

  const showUpdateAvailableBanner = useSignal(false);

  const handleEvent = $(
    <TEventType extends SW_EVENT>(
      broadcastChannel: BroadcastChannel,
      eventType: TEventType | string,
      payload: CACHING_EVENT_PAYLOAD_MAP[TEventType]
    ) => {
      switch (eventType) {
        case SW_EVENT.PRECACHING_STARTED:
        case SW_EVENT.PRECACHING_PROGRESS: {
          const p =
            payload as CACHING_EVENT_PAYLOAD_MAP[SW_EVENT.PRECACHING_STARTED];
          cachingStats.cachingIsStarted = true;
          cachingStats.total = p.total;
          cachingStats.cached = p.cached;
          break;
        }

        case SW_EVENT.PRECACHING_COMPLETE:
          cachingStats.cachingIsDone = true;
          broadcastChannel.postMessage({
            type: "PRECACHE_PID_ANALYZER_CHECK",
          });
          break;

        case SW_EVENT.SERVICE_WORKER_ACTIVATED:
          showUpdateAvailableBanner.value = true;
          break;

        default:
          console.error("Unknown event type:", eventType, payload);
      }
    }
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

    await navigator.serviceWorker.register("/service-worker.js");

    const broadcastChannel = new BroadcastChannel("service-worker");
    broadcastChannel.postMessage({ type: "ATTACH_LISTENER_PRECACHING" });

    broadcastChannel.addEventListener("message", (event: any): void => {
      try {
        const { type, payload } = event.data;

        handleEvent(broadcastChannel, type, payload);
      } catch (e) {
        console.error("Failed to parse event data:", event);
      }
    });
  });

  const cachingCompletedPercentage = useComputed$(() => {
    return Math.round((cachingStats.cached / cachingStats.total) * 100);
  });

  const reload = $(() => {
    location.reload();
  });

  return (
    <div>
      <Banner show={showCachingProgressBanner} variant="info">
        <div>
          Updating App-Cache for offline usage.
          <br />
          <small>Navigations might be slow during this process...</small>
        </div>
        {cachingCompletedPercentage}%
      </Banner>
      <Banner show={showUpdateAvailableBanner} variant="success">
        a new version was loaded in the background!
        <br />
        <button onClick$={reload} class="button">Reload now!</button>
      </Banner>
    </div>
  );
});
