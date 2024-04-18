import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import LogoImage from "./logo.webp?jsx";
import styles from "./logo.module.css";
import classNames from "classnames";
import type { CMSRegisteredComponent } from "../cms-registered-component";

export const Logo = component$<QwikIntrinsicElements["img"]>((props) => {
  return (
    <LogoImage
      width="200px"
      height="auto"
      alt="Logo"
      {...props}
      class={classNames(styles.logo, props.class)}
    />
  );
});

export const LogoRegistryInformation: CMSRegisteredComponent = {
  component: Logo,
  name: "Logo",
  inputs: [],
};
