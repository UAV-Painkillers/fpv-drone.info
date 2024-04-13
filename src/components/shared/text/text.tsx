import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { formatHtmlText } from "../../../utils/formatHtmlText";

export interface TextProps {
  text: string;
}

type ComponentProps = TextProps & IntrinsicElements["div"];

export const Text = component$<ComponentProps>((props) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const html = formatHtmlText(props.text ?? "");
  return <div {...props} dangerouslySetInnerHTML={html} />;
});

export const TextRegistryDefinition: RegisteredComponent = {
  component: Text,
  name: "Text",
  inputs: [
    {
      name: "text",
      friendlyName: "Text",
      type: "richText",
      required: true,
    },
  ],
};
