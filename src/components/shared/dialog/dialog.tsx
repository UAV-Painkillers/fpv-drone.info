import type { QRL } from "@builder.io/qwik";
import { Slot, component$, useSignal, $ } from "@builder.io/qwik";
import classNames from "classnames";
import styles from "./dialog.module.css";

interface Props {
  onClose?: QRL<() => any>;
  class?: string;
  isOpen?: boolean;
}
export const Dialog = component$<Props>((props) => {
  const dialogRef = useSignal<HTMLDialogElement>();

  if (props.isOpen) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }

  return (
    <dialog
      class={classNames(props.class, styles.dialog)}
      ref={dialogRef}
      onClose$={$((e) => {
        e.preventDefault();

        if (typeof props.onClose !== "function") {
          return;
        }

        props.onClose();
      })}
    >
      <div
        class={styles.backdrop}
        onClick$={() => {
          if (typeof props.onClose !== "function") {
            return;
          }

          props.onClose();
        }}
      />
      <div class={styles.content}>
        <Slot />
      </div>

      <div class={styles.footer}>
        <Slot name="footer" />
        {typeof props.onClose === "function" && (
          <button
            onClick$={props.onClose}
            class={classNames("button", "warning", styles.closeButton)}
          >
            Close
          </button>
        )}
      </div>
    </dialog>
  );
});
