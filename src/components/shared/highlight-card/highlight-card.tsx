import { component$ } from "@builder.io/qwik";
import { formatHtmlText } from "~/utils/formatHtmlText";
import styles from "./highlight-card.module.css";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

interface Props {
  title?: string;
  content?: string;
}
export const HighlightCard = component$((props: Props) => {
  const contentHtml = formatHtmlText(props.content ?? "");

  return (
    <div class={styles.tipCard}>
      <b>{props.title}:</b>
      <div dangerouslySetInnerHTML={contentHtml}></div>
    </div>
  );
});

export const HighlightCardRegistryDefinition: RegisteredComponent = {
  component: HighlightCard,
  name: "HightlightCard",
  friendlyName: "Higlight Card",
  inputs: [
    {
      name: "title",
      friendlyName: "Title",
      type: "string",
      required: true,
    },
    {
      name: "content",
      friendlyName: "Content",
      type: "richText",
      required: true,
    },
  ],
};
