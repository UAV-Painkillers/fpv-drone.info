import { component$ } from "@builder.io/qwik";
import { DynamicLinkList } from "../dynamic-link-list/dynamic-link-list";
import styles from "./footer.module.css";
import { NavLink } from "../nav-link/nav-link";

export const Footer = component$(() => {
  return (
    <footer class={styles.container}>
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
