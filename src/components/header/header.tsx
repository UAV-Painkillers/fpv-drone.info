import { component$ } from "@builder.io/qwik";
import { QwikLogo } from "../icons/qwik";
import styles from "./header.module.css";

export default component$(() => {
  return (
    <header class={styles.header}>
      <div class={styles.wrapper}>
        <div class={styles.logo}>
          <a href="/" title="qwik">
            <QwikLogo height={50} width={143} />
          </a>
        </div>
        <ul>
          <li>
            <a
              href="/news"
              target="_blank"
            >
              News
            </a>
          </li>
          <li>
            <a
              href="/reviews"
              target="_blank"
            >
              Reviews
            </a>
          </li>
          <li>
            <a
              href="/projects"
              target="_blank"
            >
              Projects
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
});
