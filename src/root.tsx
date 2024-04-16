import { component$, useContextProvider, useStore } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";

import "./normalize.css";
import "./global.css";
import { RouterHead } from "./components/router-head/router-head";
import type { AppContextState } from "./app.ctx";
import { AppContext } from "./app.ctx";

export default component$(() => {
  const appContextData = useStore<AppContextState>({
    showPageHeader: true,
    isPreviewing: false,
    serviceWorker: undefined,
  });
  useContextProvider(AppContext, appContextData);

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
