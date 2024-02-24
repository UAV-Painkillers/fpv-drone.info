import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import LogoImage from "./logo.svg?jsx";
import styles from "./logo.module.css";
import classNames from "classnames";

export const Logo = component$<QwikIntrinsicElements["svg"]>((props) => {
  return <LogoImage {...props} class={classNames(styles.logo, props.class)} />;
});
