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
import { PWAInstallButton } from "~/components/pwa-install-button/pwa-install-button";
import { ServiceWorkerManager } from "~/components/service-worker-manager/service-worker-manager";
import { StoryblokContext } from "./[...index]/storyblok.ctx";
import { getStoryBlokApi } from "./plugin@storyblok";
import { TranslationsContext } from "~/translations.ctx";

const languages = ["de", "en"];

export const useStoryBlokPreviewInformation = routeLoader$(({ url }) => {
  const isVisualEditor = url.searchParams.has("_storyblok");
  const previewLanguage = url.searchParams.get("_storyblok_lang");

  const versionToLoad: "published" | "draft" = isVisualEditor
    ? "draft"
    : "published";

  const [, languagePart, ...remainingPath] = url.pathname.split("/");

  let languageSlug = null;
  if (languages.includes(languagePart)) {
    languageSlug = languagePart;
  }

  const language: string = previewLanguage ?? languageSlug ?? "en";

  let slug = remainingPath.join("/");
  if (languageSlug === null) {
    slug = `${languagePart}/${slug}`;
  }

  if (slug === "/" || slug === "") {
    slug = "home";
  }

  if (slug.endsWith("/")) {
    slug = slug.slice(0, -1);
  }

  return {
    versionToLoad,
    language,
    slug,
  };
});

export const useTranslationsFromStoryblok = routeLoader$(
  async ({ resolveValue }) => {
    const { language } = await resolveValue(useStoryBlokPreviewInformation);

    const allDataSourceEntries = [];
    let nextPage = 1;
    for (;;) {
      const { data, total } = await getStoryBlokApi().get("cdn/datasource_entries", {
        datasource: "translations",
        dimension: language,
        page: nextPage,
        per_page: 100,
      });

      allDataSourceEntries.push(...data.datasource_entries);

      if (total <= allDataSourceEntries.length) {
        break;
      }

      nextPage++;
    }

    return Object.fromEntries(
      allDataSourceEntries.map((entry: any) => [
        entry.name,
        entry.dimension_value ?? entry.value,
      ])
    );
  }
);

export default component$(() => {
  const appContext = useContext(AppContext);
  const location = useLocation();

  const storyblokContext = useContext(StoryblokContext);
  const storyBlokPreviewData = useStoryBlokPreviewInformation();
  const translationsData = useTranslationsFromStoryblok();
  const translationsContext = useContext(TranslationsContext);

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
    track(translationsData);
    track(storyBlokPreviewData);

    translationsContext.activeLanguage = storyBlokPreviewData.value.language;
    translationsContext.translations = translationsData.value;
  });

  useTask$(({ track }) => {
    track(location);

    appContext.isPreviewing = location.url.searchParams.has("builder.preview");
  });

  return (
    <>
      {/* TODO: Add iframe src */}
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
