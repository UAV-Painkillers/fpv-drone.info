import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import LogoImage from "./logo.webp?jsx";
import LogoDarkImage from "./logo_dark.webp?jsx";
import styles from "./logo.module.css";
import classNames from "classnames";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { useDarkmode } from "~/hooks/use-darkmode";

export const Logo = component$<QwikIntrinsicElements["img"]>((props) => {
  const imageProps = {
    width: "200px",
    height: "auto",
    alt: "Logo",
    ...props,
    class: classNames(styles.logo, props.class),
  };

  const isDarkmode = useDarkmode();

  if (isDarkmode.value) {
    return <LogoDarkImage {...imageProps} />;
  }

  return <LogoImage {...imageProps} />;
});

export const LogoRegistryInformation: RegisteredComponent = {
  component: Logo,
  name: "Logo",
  inputs: [],
};
