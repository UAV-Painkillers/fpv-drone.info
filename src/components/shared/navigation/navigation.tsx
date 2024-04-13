import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import styles from "./navigation.module.css";
import { DynamicLinkList } from "../dynamic-link-list/dynamic-link-list";
import classNames from "classnames";

export const Navigation = component$<IntrinsicElements["nav"]>((props) => {
  return (
    <nav {...props} class={classNames(styles.container, props.class)}>
      <DynamicLinkList linkModel="navigation-link" />
    </nav>
  );
});
