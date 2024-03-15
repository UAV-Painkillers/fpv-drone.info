import type { QwikIntrinsicElements} from "@builder.io/qwik";
import { Slot, component$ } from "@builder.io/qwik";
import styles from "./inset.module.css";

export const Inset = component$<QwikIntrinsicElements["div"]>(() => {
  return (
    <div class={styles.inset}>
      <Slot />
    </div>
  );
});
