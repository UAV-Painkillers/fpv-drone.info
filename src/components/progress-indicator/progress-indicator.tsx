import { component$ } from "@builder.io/qwik";
import styles from "./progress-indicator.module.css";

interface Props {
  indefinite?: boolean;
  progress?: number;
  total?: number;
}

export const ProgressIndicator = component$((props: Props) => {
  const { indefinite, progress, total } = props;

  const progressValue = progress ? (progress / (total ?? 100)) * 100 : 0;

  // https://kimmobrunfeldt.github.io/progressbar.js/
  return (
    <div class={styles.progressBar}>
      <span class={styles.progressBarFill} style="width: 70%;"></span>
    </div>
  );
});
