import { Slot, component$ } from "@builder.io/qwik";
import {
  Prerequesites,
  type PrerequesitesProps,
} from "./prerequesites/prerequesites";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

interface Props {
  prerequesites?: PrerequesitesProps;
}
export const CustomInstructions = component$((props: Props) => {
  return (
    <article>
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {(props.prerequesites?.items?.length ?? 0) > 0 && (
        <>
          <Prerequesites {...props.prerequesites!} />
        </>
      )}
      <Slot />
    </article>
  );
});

export const CustomInstructionsRegistryDefinition: RegisteredComponent = {
  component: CustomInstructions,
  name: "CustomizableInstructions",
  friendlyName: "Customizable Instructions",
  canHaveChildren: true,
  childRequirements: {
    message:
      "You can only put Instruction - Step components inside this component.",
    query: {
      $or: [
        { "component.name": { $in: ["InstructionsStep"] } },
        { "component.name": { $in: ["Symbol"] } },
      ],
    },
  },
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
  ],
};
