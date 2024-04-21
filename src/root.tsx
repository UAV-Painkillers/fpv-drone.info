import {
  component$,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";

import "./normalize.css";
import "./css/theme.css";
import "./css/global.css";
import { RouterHead } from "./components/router-head/router-head";
import type { AppContextState } from "./app.ctx";
import { AppContext } from "./app.ctx";
import { inject as injectVercelAnalytics } from "@vercel/analytics";
import { useDarkmode } from "./hooks/use-darkmode";
import classNames from "classnames";
import type { StoryblokContextState } from "./routes/[...index]/storyblok.ctx";
import { StoryblokContext } from "./routes/[...index]/storyblok.ctx";
import type { TranslationsContextState } from "./translations.ctx";
import { TranslationsContext } from "./translations.ctx";

export default component$(() => {
  const appContextData = useStore<AppContextState>({
    showPageHeader: true,
    isPreviewing: false,
    serviceWorker: undefined,
    unblockedCaches: [],
    translations: {},
  });
  useContextProvider(AppContext, appContextData);

  const translationsContextData = useStore<TranslationsContextState>({
    activeLanguage: "en",
    translations: {},
  });
  useContextProvider(TranslationsContext, translationsContextData);

  const storyblokContextData = useStore<StoryblokContextState>({
    versionToLoad: "published",
    language: "en",
  });
  useContextProvider(StoryblokContext, storyblokContextData);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    injectVercelAnalytics();
  });

  const isDarkmode = useDarkmode();

  return (
    <QwikCityProvider>
      <head>
        <RouterHead />
      </head>
      <body lang="en" class={classNames({ dark: isDarkmode.value })}>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
