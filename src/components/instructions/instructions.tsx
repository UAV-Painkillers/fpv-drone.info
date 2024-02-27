import { component$ } from "@builder.io/qwik";
import { Step, type StepProps } from "./step/step";
import type { PrerequesitesProps } from "./prerequesites/prerequesites";
import { Prerequesites } from "./prerequesites/prerequesites";
import styles from "./instructions.module.css";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

interface Props {
  prerequesites?: PrerequesitesProps;
  steps?: StepProps[];
}
export const Instructions = component$<Props>((props) => {
  return (
    <article>
      {props.prerequesites && (
        <>
          <Prerequesites
            {...props.prerequesites}
            class={styles.prerequesites}
          />
          <hr />
        </>
      )}
      {props.steps?.map((step, index) => (
        <>
          <Step key={`step-${index}`} {...step} index={index + 1} />
          {index < (props.steps?.length ?? 0) - 1 && <hr />}
        </>
      ))}
    </article>
  );
});

export const InstructionsRegistryInformation: RegisteredComponent = {
  component: Instructions,
  name: "Instructions",
  inputs: [
    {
      name: "prerequesites",
      friendlyName: "Prerequesites",
      type: "object",
      required: false,
      subFields: [
        {
          name: "title",
          friendlyName: "Title",
          type: "string",
          required: false,
        },
        {
          name: "items",
          friendlyName: "Items",
          type: "list",
          required: true,
          subFields: [
            {
              name: "label",
              type: "string",
              required: true,
            },
          ],
        },
        {
          name: "image",
          friendlyName: "Image",
          type: "file",
          required: true,
          allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
        },
      ],
    },
    {
      name: "steps",
      friendlyName: "Steps",
      type: "list",
      required: true,
      subFields: [
        {
          name: "title",
          friendlyName: "Title",
          type: "string",
          required: true,
        },
        {
          name: "image",
          friendlyName: "Image",
          type: "file",
          required: false,
          allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
        },
        {
          name: "description",
          friendlyName: "Description",
          type: "richText",
          required: true,
        },
      ],
    },
  ],
};
