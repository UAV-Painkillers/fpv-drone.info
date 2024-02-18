import { component$ } from "@builder.io/qwik";
import styles from "./header.module.css";
import { Logo } from "../logo/logo";
import { Navigation } from "../navigation/navigation";
import { Search } from "../search/search";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <header class={styles.header}>
      <div class={styles.columnOne}>
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div class={styles.columnTwo}>
        <Navigation />
      </div>
      <div class={styles.columnThree}>
        <Search />
      </div>
    </header>
  );
});
