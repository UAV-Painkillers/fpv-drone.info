import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { formatHtmlText } from "~/utils/formatHtmlText";

interface Props {
  text: string;
}
export const Text = component$<Props & IntrinsicElements["div"]>((props) => {
  const html = formatHtmlText(props.text);
  return <div {...props} dangerouslySetInnerHTML={html} />;
});
