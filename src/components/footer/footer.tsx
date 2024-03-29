import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import styles from "./footer.module.css";
import classNames from "classnames";
import { DynamicLinkList } from "../shared/dynamic-link-list/dynamic-link-list";
import { NavLink } from "../shared/nav-link/nav-link";

export const Footer = component$<IntrinsicElements["footer"]>((props) => {
  return (
    <footer {...props} class={classNames(styles.container, props.class)}>
      <DynamicLinkList linkModel="footer-link" />
      <p>
        fpv-drone.info is a{" "}
        <NavLink href="https://uav-painkillers.de" target="_blank">
          UAV-Painkillers
        </NavLink>{" "}
        project
        <br />
        <br />
        &copy; 2024 Jaap und Piskun GbR - UAV Painkillers
      </p>
    </footer>
  );
});
