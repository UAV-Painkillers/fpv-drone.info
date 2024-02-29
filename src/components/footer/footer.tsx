import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import styles from "./footer.module.css";
import { DynamicLinkList, NavLink } from "@jappyjan/qwik-jminimal/src";
import classNames from "classnames";

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
