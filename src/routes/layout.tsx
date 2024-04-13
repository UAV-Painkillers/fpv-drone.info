import {
  component$,
  Slot,
  useContext,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import "@fontsource/libre-barcode-128-text/400.css";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import { Footer } from "~/components/footer/footer";
import { inject as injectVercelAnalytics } from "@vercel/analytics";
import { Logo } from "~/components/logo/logo";
import { Link, useLocation } from "@builder.io/qwik-city";
import { Navigation } from "~/components/shared/navigation/navigation";
import { AppContext } from "~/app.ctx";
import { SearchButton } from "~/components/shared/search/search-button";
import { QwikCityNprogress } from "@quasarwork/qwik-city-nprogress";

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    injectVercelAnalytics();
  });

  const appContext = useContext(AppContext);
  const location = useLocation();

  useTask$(({ track }) => {
    track(location);

    appContext.isPreviewing = location.url.searchParams.has("builder.preview");
  });

  return (
    <>
      <iframe src={location.url.href} style="display: none" />
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
          <Slot />
        </main>
      </div>
      <Footer />
    </>
  );
});
