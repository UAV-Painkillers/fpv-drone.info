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

// extend window element for matomo
declare global {
  interface Window {
    _paq: any;
  }
}

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
    if (import.meta.env.VITE_VERCEL_ANALYTICS_ENABLED !== "TRUE") {
      return;
    }

    injectVercelAnalytics();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const matomoHostEnv = import.meta.env.VITE_MATOMO_HOST;
    if (!matomoHostEnv) {
      return;
    }

    const matomoHost = `//${matomoHostEnv}/`;

    const _paq = (window._paq = window._paq || []);

    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(["trackPageView"]);
    _paq.push(["trackVisibleContentImpressions"]);
    _paq.push(["enableLinkTracking"]);
    _paq.push(["setTrackerUrl", matomoHost + "matomo.php"]);
    _paq.push(["setSiteId", "1"]);

    const matomoScriptTag = document.createElement("script");
    matomoScriptTag.async = true;
    matomoScriptTag.src = matomoHost + "not_matomo.js";

    const firstScriptTagInDocument = document.getElementsByTagName("script")[0];
    firstScriptTagInDocument.parentNode!.insertBefore(
      matomoScriptTag,
      firstScriptTagInDocument
    );
  });

  const isDarkmode = useDarkmode();

  return (
    <QwikCityProvider>
      <head>
        <RouterHead />

        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7620103917010301"
     crossorigin="anonymous"></script>
      </head>
      <body lang="en" class={classNames({ dark: isDarkmode.value })}>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
