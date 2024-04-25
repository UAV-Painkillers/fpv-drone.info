import type { QRL } from "@builder.io/qwik";
import { Slot, component$, useSignal, $ } from "@builder.io/qwik";
import classNames from "classnames";
import styles from "./dialog.module.css";
import { inlineTranslate } from "qwik-speak";

interface Props {
  onClose?: QRL<() => any>;
  class?: string;
  isOpen?: boolean;
}
export const Dialog = component$<Props>((props) => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const t = inlineTranslate();

  if (props.isOpen) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }

  const closeLabel = t("dialog.close") as string;

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
            {closeLabel}
          </button>
        )}
      </div>
    </dialog>
  );
});
