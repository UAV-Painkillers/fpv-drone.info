import type { Signal } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { useCSSTransition } from "qwik-transition";
import classNames from "classnames";
import styles from "./banner.module.css";

interface Props {
  show: Signal<boolean>;
  variant: "success" | "warning" | "error" | "info";
}

export const Banner = component$((props: Props) => {
  const { stage, shouldMount } = useCSSTransition(props.show, {
    timeout: 1000,
  });

  return (
    <>
      {shouldMount.value ? (
        <div
          class={classNames(
            styles.banner,
            {
              [styles.hidden]: stage.value !== "enterTo",
            },
            styles[props.variant],
          )}
        >
          <Slot />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
});
