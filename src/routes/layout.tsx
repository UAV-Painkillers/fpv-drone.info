import { component$, Slot, useContext, useTask$ } from "@builder.io/qwik";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import { Footer } from "~/components/footer/footer";
import { Logo } from "~/components/logo/logo";
import { Link, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { Navigation } from "~/components/shared/navigation/navigation";
import { AppContext } from "~/app.ctx";
import { SearchButton } from "~/components/shared/search/search-button";
import { QwikCityNprogress } from "@quasarwork/qwik-city-nprogress";
import { PWAInstallBanner } from "~/components/pwa-install-banner/pwa-install-banner";
import { ServiceWorkerManager } from "~/components/service-worker-manager/service-worker-manager";
import { StoryblokContext } from "./[...index]/storyblok.ctx";
import { LanguageBanner } from "~/components/language-banner/language-banner";
import { config as speakConfig } from "~/speak";

export const useStoryBlokPreviewInformation = routeLoader$(
  ({ params, query, locale }) => {
    const isVisualEditor = query.has("_storyblok");
    const previewLanguage = query.get("_storyblok_lang");

    const versionToLoad: "published" | "draft" = isVisualEditor
      ? "draft"
      : "published";

    const { index: indexParam } = params;

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unnecessary-condition
    let [langPart, ...indexParamParts] = (indexParam ?? '').split("/");

    if (langPart.length !== 2) {
      indexParamParts.unshift(langPart);
      langPart = '';
    }

    let slug = indexParamParts.join("/");
    if (
      langPart &&
      !speakConfig.supportedLocales.find((locale) => locale.lang === langPart)
    ) {
      slug = `${langPart}/${slug}`;
    }

    if (!slug || slug.trim() === "") {
      slug = "/";
    }

    if (slug === "/" || slug === "") {
      slug = "home";
    }

    if (slug.endsWith("/")) {
      slug = slug.slice(0, -1);
    }

    const language = previewLanguage ?? locale();

    return {
      versionToLoad,
      language,
      slug,
    };
  },
);

export default component$(() => {
  const appContext = useContext(AppContext);
  const location = useLocation();

  const storyblokContext = useContext(StoryblokContext);
  const storyBlokPreviewData = useStoryBlokPreviewInformation();

  useTask$(({ track }) => {
    track(storyBlokPreviewData);

    try {
      storyblokContext.versionToLoad = storyBlokPreviewData.value.versionToLoad;
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
      <QwikCityNprogress />
      <PWAInstallBanner />
      <LanguageBanner />
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
          <Slot />
        </main>
      </div>
      <Footer />
    </>
  );
});
