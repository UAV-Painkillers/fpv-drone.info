import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { Slot, component$ } from "@builder.io/qwik";
import classNames from "classnames";
import styles from "./dialog.module.css";

export const Dialog = component$<QwikIntrinsicElements["dialog"]>((props) => {
  return (
    <dialog {...props} class={classNames(props.class, styles.dialog)}>
      <Slot />
    </dialog>
  );
});
