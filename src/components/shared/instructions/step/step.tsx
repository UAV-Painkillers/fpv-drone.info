import { Slot, component$ } from "@builder.io/qwik";
import styles from "./step.module.css";
import { formatHtmlText } from "../../../../utils/formatHtmlText";
import { ExpandableImage } from "../../expandable-image/expandable-image";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

export interface StepProps {
  index: number;
  title: string;
  description: string;
  image?: string;
}
export const InstructionsStep = component$<StepProps>((props) => {
  const formattedDescription = formatHtmlText(props.description);

  return (
    <section class={styles.wrapper}>
      <h3 class={styles.index}>Step {props.index}</h3>
      <h2 class={styles.title}>{props.title}</h2>
      {props.image && (
        <ExpandableImage
          src={props.image}
          alt="step details"
          class={styles.image}
        />
      )}
      <div
        dangerouslySetInnerHTML={formattedDescription}
        class={styles.content}
      />
      <Slot />
    </section>
  );
});

export const InstructionsStepRegistryDefinition: CMSRegisteredComponent = {
  component: InstructionsStep,
  name: "InstructionsStep",
  friendlyName: "Instruction - Step",
  canHaveChildren: true,
  inputs: [
    {
      name: "index",
      friendlyName: "Step No.",
      type: "number",
      required: true,
    },
    {
      name: "title",
      friendlyName: "Title",
      type: "string",
      required: true,
    },
    {
      name: "description",
      friendlyName: "Description",
      type: "richText",
      required: false,
    },
    {
      name: "image",
      friendlyName: "Image",
      type: "file",
      required: false,
      allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
    },
  ],
};
