import { component$ } from "@builder.io/qwik";
import styles from "./inline-spinner.module.css";
import classNames from "classnames";

interface Props {
  success?: boolean;
  error?: boolean;
  waiting?: boolean;
}
export const InlineSpinner = component$((props: Props) => {
  return <i class={classNames(styles.inlineSpinner, {[styles.success]: props.success, [styles.error]: props.error, [styles.waiting]: props.waiting})}></i>;
});
