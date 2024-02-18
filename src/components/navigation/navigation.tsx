import { component$ } from "@builder.io/qwik";
import styles from "./navigation.module.css";
import { DynamicLinkList } from "../dynamic-link-list/dynamic-link-list";

export const Navigation = component$(() => {
  return (
    <nav class={styles.container}>
      <DynamicLinkList linkModel="navigation-link" />
    </nav>
  );
});
