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
import { injectSpeedInsights } from "@vercel/speed-insights";
import { PWAInstallButton } from "./components/pwa-install-button/pwa-install-button";

export default component$(() => {
  const appContextData = useStore<AppContextState>({
    showPageHeader: true,
    isPreviewing: false,
  });
  useContextProvider(AppContext, appContextData);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    injectSpeedInsights();
  });

  return (
    <QwikCityProvider>
      <head>
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="en">
        <PWAInstallButton />
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
