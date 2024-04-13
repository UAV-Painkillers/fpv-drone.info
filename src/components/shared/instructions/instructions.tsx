import { component$ } from "@builder.io/qwik";
import { InstructionsStep, type StepProps } from "./step/step";
import type { PrerequesitesProps } from "./prerequesites/prerequesites";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { CustomInstructions } from "./custom-instructions";

interface Props {
  prerequesites?: PrerequesitesProps;
  steps?: StepProps[];
}
export const Instructions = component$<Props>((props) => {
  return (
    <CustomInstructions prerequesites={props.prerequesites}>
      {props.steps?.map((step, index) => (
        <>
          <InstructionsStep key={`step-${index}`} {...step} index={index + 1} />
          {index < (props.steps?.length ?? 0) - 1 && <hr />}
        </>
      ))}
    </CustomInstructions>
  );
});

export const InstructionsRegistryDefinition: RegisteredComponent = {
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
