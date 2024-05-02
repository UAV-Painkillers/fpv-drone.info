import { component$, Slot, useContext, useTask$ } from "@builder.io/qwik";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import { Footer } from "~/components/footer/footer";
import { Logo } from "~/components/logo/logo";
import { Link, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { Navigation } from "~/components/navigation/navigation";
import { AppContext } from "~/app.ctx";
import { SearchButton } from "~/components/search/search-button";
import { QwikCityNprogress } from "@quasarwork/qwik-city-nprogress";
import { PWAInstallBanner } from "~/components/pwa-install-banner/pwa-install-banner";
import { ServiceWorkerBanners } from "~/components/service-worker-banners/service-worker-banners";
import { StoryblokContext } from "./[...index]/storyblok.ctx";
import { LanguageBanner } from "~/components/language-banner/language-banner";
import { config as speakConfig } from "~/speak";
import { getStoryBlokApi } from "./plugin@storyblok";
import type { ISbStoryData } from "@storyblok/js";
import { useLastActiveLanguage } from "~/hooks/use-last-active-language";

export const useStory = routeLoader$(async ({ resolveValue }) => {
  const { versionToLoad, slug, language } = await resolveValue(useStoryblok);

  const { data } = await getStoryBlokApi()
    .getStory(slug, {
      version: versionToLoad,
      language,
      resolve_relations: [
        "*",
        "cms-snippet.reference",
        "instruction-step-item.sourceStep",
        "instruction-step-item.*",
      ],
    })
    .catch((e) => {
      console.error("Error fetching story for page", slug, e);
      return { data: { story: null } };
    });

  return data.story as ISbStoryData | null;
});

export const useStoryblok = routeLoader$(({ params, query, locale }) => {
  const isVisualEditor = query.has("_storyblok");
  const previewLanguage = query.get("_storyblok_lang");

  const versionToLoad: "published" | "draft" = isVisualEditor
    ? "draft"
    : "published";

  const { index: indexParam } = params;

  // eslint-disable-next-line prefer-const, @typescript-eslint/no-unnecessary-condition
  let [langPart, ...indexParamParts] = (indexParam ?? "").split("/");

  if (langPart.length !== 2) {
    indexParamParts.unshift(langPart);
    langPart = "";
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
});

export default component$(() => {
  const appContext = useContext(AppContext);
  const location = useLocation();

  const storyblokContext = useContext(StoryblokContext);
  const storyBlokPreviewData = useStoryblok();

  useLastActiveLanguage();

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
      <ServiceWorkerBanners />
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
          <Slot />
        </main>
      </div>
      <Footer />
    </>
  );
});
