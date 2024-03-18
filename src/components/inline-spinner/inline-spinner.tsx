import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import styles from "./inline-spinner.module.css";
import classNames from "classnames";

interface Props {
  success?: boolean;
  error?: boolean;
  waiting?: boolean;
}
export const InlineSpinner = component$(
  (props: Props & QwikIntrinsicElements["i"]) => {
    const { success, error, waiting, ...rest } = props;
    return (
      <i
        {...rest}
        class={classNames(
          styles.inlineSpinner,
          {
            [styles.success]: success,
            [styles.error]: error,
            [styles.waiting]: waiting,
          },
          rest.class,
        )}
      ></i>
    );
  },
);
