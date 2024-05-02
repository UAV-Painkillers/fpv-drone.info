import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import { formatHtmlText } from "../../utils/formatHtmlText";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { renderRichText, storyblokEditable } from "@storyblok/js";

export interface TextProps {
  text: string;
  align?: "left" | "center" | "right";
  wrapWithSmall?: boolean;
}

type ComponentProps = TextProps & IntrinsicElements["div"];

export const Text = component$<ComponentProps>((props) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const html = useComputed$(() => formatHtmlText(props.text ?? ""));
  const content = () => (
    <div
      {...props}
      style={{ textAlign: props.align }}
      dangerouslySetInnerHTML={html.value}
    />
  );

  if (props.wrapWithSmall) {
    return <small>{content()}</small>;
  }

  return content();
});

export const TextRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyProps: { text: any }) => {
    const renderedText = useComputed$(() => {
      return renderRichText(storyProps.text);
    });

    return (
      <Text
        {...storyblokEditable(storyProps)}
        {...storyProps}
        text={renderedText.value}
      />
    );
  }),
  name: "Text",
};
