import {
  component$,
  Slot,
  useContext,
  useVisibleTask$,
} from "@builder.io/qwik";
import "@fontsource/libre-barcode-128-text/400.css";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import { Footer } from "~/components/footer/footer";
import { inject as injectVercelAnalytics } from "@vercel/analytics";
import { Logo } from "~/components/logo/logo";
import { Link } from "@builder.io/qwik-city";
import { Navigation } from "~/components/shared/navigation/navigation";
import { Search } from "~/components/shared/search/search";
import { AppContext } from "~/app.ctx";

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    injectVercelAnalytics();
  });

  const appContext = useContext(AppContext);

  return (
    <>
      <div class={styles.appContainer}>
        {appContext.showPageHeader && (
          <>
            <Link href="/" class={styles.logo}>
              <Logo />
            </Link>
            <Navigation class={styles.navigation} />
            <Search class={styles.search} />
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
