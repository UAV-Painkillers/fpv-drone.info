import { component$ } from "@builder.io/qwik";
import styles from "./step.module.css";
import { ExpandableImage } from "~/components/expandable-image/expandable-image";

export interface StepProps {
  index: number;
  title: string;
  description: string;
  image?: string;
}
export const Step = component$<StepProps>((props) => {
  const formattedDescription = props.description.replace('<a', '<a target="_blank" class="anchor"');

  return (
    <section>
      <h3 class={styles.index}>Step {props.index}</h3>
      <h2 class={styles.title}>{props.title}</h2>
      {props.image && (
        <ExpandableImage src={props.image} class={styles.image} />
      )}
      <div dangerouslySetInnerHTML={formattedDescription} class={styles.content} />
    </section>
  );
});
