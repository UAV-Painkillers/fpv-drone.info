import {
  component$,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";

import "./normalize.css";
import "./global.css";
import { RouterHead } from "./components/router-head/router-head";
import type { AppContextState } from "./app.ctx";
import { AppContext } from "./app.ctx";
import { Workbox } from "workbox-window";

export default component$(() => {
  const appContextData = useStore<AppContextState>({
    showPageHeader: true,
    isPreviewing: false,
  });
  useContextProvider(AppContext, appContextData);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const wb = new Workbox("/service-worker.js");

    wb.addEventListener("message", (event) => {
      if (event.data.type === "CACHE_UPDATED") {
        const { updatedURL } = event.data.payload;

        alert(`A newer version of ${updatedURL} is available!`);
      }
    });

    // Register the service worker after event listeners have been added.
    wb.register();
  });

  return (
    <QwikCityProvider>
      <head>
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
