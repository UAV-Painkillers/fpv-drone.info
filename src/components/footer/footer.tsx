import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import styles from "./footer.module.css";
import classNames from "classnames";
import { DynamicLinkList } from "../shared/dynamic-link-list/dynamic-link-list";
import { NavLink } from "../shared/nav-link/nav-link";
import { useTranslation } from "~/translations.ctx";

export const Footer = component$<IntrinsicElements["footer"]>((props) => {
  const ownerLine = useTranslation("footer.owner", {
    link: (
      <NavLink href="https://uav-painkillers.de" target="_blank">
        UAV-Painkillers
      </NavLink>
    ),
  });

  return (
    <footer {...props} class={classNames(styles.container, props.class)}>
      <DynamicLinkList navigationStorySlug="navigations/navigation-footer" />
      <br />
      <br />
      <p>
        {ownerLine}
        <br />
        <br />
        <small>&copy; 2024 Jaap und Piskun GbR - UAV Painkillers</small>
      </p>
    </footer>
  );
});
