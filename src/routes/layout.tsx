import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import Header from "../components/header/header";
import "@fontsource/libre-barcode-128-text/400.css";
import "@fontsource-variable/montserrat/wght.css";
import styles from "./layout.module.css";
import "./normalize.css";
import { Footer } from "~/components/footer/footer";
import { inject as injectVercelAnalytics } from "@vercel/analytics";

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    injectVercelAnalytics();
  });

  return (
    <div class={styles.appContainer}>
      <div class={styles.contentContainer}>
        <Header />
        <main>
          <Slot />
        </main>
      </div>
      <Footer />
    </div>
  );
});
