import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import LogoImage from "./logo.webp?jsx";
import styles from "./logo.module.css";
import classNames from "classnames";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

export const Logo = component$<QwikIntrinsicElements["img"]>((props) => {
  return (
    <LogoImage
      width="200px"
      height="auto"
      {...props}
      class={classNames(styles.logo, props.class)}
    />
  );
});

export const LogoRegistryInformation: RegisteredComponent = {
  component: Logo,
  name: "Logo",
  inputs: [],
};
