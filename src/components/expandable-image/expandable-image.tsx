import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, useSignal, $, useOnWindow } from "@builder.io/qwik";
import { Dialog } from "../dialog/dialog";
import styles from "./expandable-image.module.css";
import classNames from "classnames";

interface Props {
  onClick$?: () => void;
}
export const ExpandableImage = component$<
  Omit<QwikIntrinsicElements["img"], "onClick$"> & Props
>((props) => {
  const dialogRef = useSignal<HTMLDialogElement>();

  const openDialog = $(() => {
    if (!dialogRef.value) {
      console.warn("Dialog ref not set");
      return;
    }

    dialogRef.value.showModal();
  });

  useOnWindow(
    "keydown",
    $((event) => {
      if (event.key === "Escape") {
        dialogRef.value?.close();
      }
    }),
  );

  return (
    <div class={classNames(styles.container, "clickable")}>
      <img {...props} class={classNames(props.class, styles.image)} />
      <span class={styles.label} onClick$={openDialog}>
        Click to enlarge
      </span>
      <Dialog ref={dialogRef} onClick$={() => dialogRef.value?.close()}>
        <img
          src={props.src}
          alt={props.alt}
          width={props.width}
          height={props.height}
        />
      </Dialog>
    </div>
  );
});
