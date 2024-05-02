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
import { useQwikSpeak } from "qwik-speak";
import {
  translationFn as speakTranslationFn,
  config as speakConfig,
} from "./speak";

export default component$(() => {
  useQwikSpeak({ config: speakConfig, translationFn: speakTranslationFn });
  const appContextData = useStore<AppContextState>({
    showPageHeader: true,
    isPreviewing: false,
    unblockedCaches: [],
    translations: {},
  });
  useContextProvider(AppContext, appContextData);

  const storyblokContextData = useStore<StoryblokContextState>({
    versionToLoad: "published",
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
