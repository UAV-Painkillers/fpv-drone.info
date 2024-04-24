import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useComputed$ } from "@builder.io/qwik";
import styles from "./step.module.css";
import { formatHtmlText } from "../../../../utils/formatHtmlText";
import { ExpandableImage } from "../../expandable-image/expandable-image";

export interface StepProps {
  index: number;
  title: string;
  description: string;
  image?: string;
}
export const InstructionsStep = component$<
  StepProps & IntrinsicElements["section"]
>((props) => {
  const { description, index, title, image, ...sectionProps } = props;

  const formattedDescription = useComputed$(() => formatHtmlText(description));

  return (
    <section {...sectionProps} class={styles.wrapper}>
      <h3 class={styles.index}>Step {index}</h3>
      <h2 class={styles.title}>{title}</h2>
      {image && (
        <ExpandableImage src={image} alt="step details" class={styles.image} />
      )}
      <div
        dangerouslySetInnerHTML={formattedDescription.value}
        class={styles.content}
      />
      <Slot />
    </section>
  );
});
