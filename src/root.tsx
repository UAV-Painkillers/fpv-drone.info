import {
  component$,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";

import "./normalize.css";
import "./global.css";
import { RouterHead } from "./components/router-head/router-head";
import type { AppContextState } from "./app.ctx";
import { AppContext } from "./app.ctx";
import { injectSpeedInsights } from "@vercel/speed-insights";

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
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
