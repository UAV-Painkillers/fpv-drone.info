import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import "@fontsource/libre-barcode-128-text/400.css";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import { Footer } from "~/components/footer/footer";
import { inject as injectVercelAnalytics } from "@vercel/analytics";
import { Logo } from "~/components/logo/logo";
import { Navigation } from "~/components/navigation/navigation";
import { Search } from "~/components/search/search";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    injectVercelAnalytics();
  });

  return (
    <>
      <div class={styles.appContainer}>
        <Link href="/" class={styles.logo}>
          <Logo />
        </Link>
        <Navigation class={styles.navigation} />
        <Search class={styles.search} />
        <main class={styles.main}>
          <Slot />
        </main>
      </div>
      <Footer />
    </>
  );
});
