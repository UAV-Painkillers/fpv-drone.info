import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, useSignal, $, useOnWindow } from "@builder.io/qwik";
import { Dialog } from "../dialog/dialog";
import styles from "./expandable-image.module.css";
import classNames from "classnames";
import { Link } from "@builder.io/qwik-city";

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
      <img
        {...props}
        class={classNames(styles.image, props.class)}
        onClick$={openDialog}
      />
      <span class={styles.label}>Click to enlarge</span>

      <Dialog ref={dialogRef} onClick$={() => dialogRef.value?.close()}>
        <div>
          <img
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            class={styles.dialogImage}
          />
          <Link href={props.src} target="_blank">
            <div class={styles.openInNewTabLinkContainer}>
              <span class="anchor">Open in new tab</span>
            </div>
          </Link>
        </div>
      </Dialog>
    </div>
  );
});
