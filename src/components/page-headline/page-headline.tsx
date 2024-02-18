import { component$ } from "@builder.io/qwik";
import styles from "./page-headline.module.css";

interface Props {
  title: string;
  subtitle?: string;
}

export const PageHeadline = component$((props: Props) => {
  return (
    <header class={styles.container}>
      <h1 class={styles.title}>{props.title}</h1>
      {props.subtitle && <h2 class={styles.subtitle}>{props.subtitle}</h2>}
    </header>
  );
});
