import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, useSignal, $, useOnWindow } from "@builder.io/qwik";
import { Dialog } from "../dialog/dialog";
import styles from "./expandable-image.module.css";
import classNames from "classnames";
import { Link } from "@builder.io/qwik-city";
import { srcToSrcSet } from "../../utils/srcToSrcSet";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

interface Props {
  onClick$?: () => void;
}
export const ExpandableImage = component$<
  Omit<QwikIntrinsicElements["img"], "onClick$"> & Props
>((props) => {
  const dialogRef = useSignal<HTMLDialogElement>();

  const showDialog = useSignal(false);

  useOnWindow(
    "keydown",
    $((event) => {
      if (event.key === "Escape") {
        dialogRef.value?.close();
      }
    }),
  );

  const srcSet =
    props.srcset ?? (props.src ? srcToSrcSet(props.src) : undefined);

  const closeDialog = $(() => {
    showDialog.value = false;
  });

  return (
    <div class={classNames(styles.container, "clickable")}>
      <img
        loading="lazy"
        {...props}
        class={classNames(styles.image, props.class)}
        onClick$={() => (showDialog.value = true)}
        srcset={srcSet}
      />
      <span class={styles.label}>Click to enlarge</span>

      <Dialog isOpen={showDialog.value} onClose={closeDialog}>
        <div class={styles.dialogContentContainer}>
          <img
            loading="lazy"
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            class={styles.dialogImage}
            srcset={srcSet}
          />
        </div>

        <Link q:slot="footer" class="button" href={props.src} target="_blank">
          Open in new tab
        </Link>
      </Dialog>
    </div>
  );
});

export const ExpandableImageRegistryDefinition: CMSRegisteredComponent = {
  component: ExpandableImage,
  name: "ExpandableImage",
};
