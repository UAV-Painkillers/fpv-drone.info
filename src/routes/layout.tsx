import {
  component$,
  Slot,
  useContext,
  useContextProvider,
  useStore,
  useTask$,
} from "@builder.io/qwik";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import { Footer } from "~/components/footer/footer";
import { Logo } from "~/components/logo/logo";
import { Link, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { Navigation } from "~/components/shared/navigation/navigation";
import { AppContext } from "~/app.ctx";
import { SearchButton } from "~/components/shared/search/search-button";
import { QwikCityNprogress } from "@quasarwork/qwik-city-nprogress";
import { PWAInstallButton } from "~/components/pwa-install-button/pwa-install-button";
import { ServiceWorkerManager } from "~/components/service-worker-manager/service-worker-manager";
import { StoryblokContext } from "./[...index]/storyblok.ctx";

export const useStoryBlokPreviewInformation = routeLoader$(({ url }) => {
  const isVisualEditor = url.searchParams.has("_storyblok");
  const previewLanguage = url.searchParams.get("_storyblok_lang");

  const versionToLoad: "published" | "draft" = isVisualEditor
    ? "draft"
    : "published";
  const language: string = previewLanguage ?? "en";

  // TODO: figure out how to get the language from the request
  return {
    versionToLoad,
    language,
  };
});

export default component$(() => {
  const appContext = useContext(AppContext);
  const location = useLocation();

  const storyblokContext = useContext(StoryblokContext);
  const storyBlokPreviewData = useStoryBlokPreviewInformation();

  useTask$(({ track }) => {
    track(storyBlokPreviewData);

    try {
      storyblokContext.versionToLoad = storyBlokPreviewData.value.versionToLoad;
      storyblokContext.language = storyBlokPreviewData.value.language;
    } catch (e) {
      console.error("Error setting storyblok preview data", e);
    }
  });

  useTask$(({ track }) => {
    track(location);

    appContext.isPreviewing = location.url.searchParams.has("builder.preview");
  });

  return (
    <>
      <iframe src={"#" || location.url.href} style="display: none" />
      <QwikCityNprogress />
      <div class={styles.appContainer}>
        {appContext.showPageHeader && (
          <>
            <Link href="/" class={styles.logo} aria-label="Go Home">
              <Logo />
            </Link>
            <Navigation class={styles.navigation} />
            <SearchButton class={styles.search} />
          </>
        )}
        <main class={styles.main}>
          <ServiceWorkerManager />
          <PWAInstallButton />
          <Slot />
        </main>
      </div>
      <Footer />
    </>
  );
});
