import { component$ } from "@builder.io/qwik";
import { formatHtmlText } from "~/utils/formatHtmlText";
import styles from "./highlight-card.module.css";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

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

export const HighlightCardRegistryDefinition: CMSRegisteredComponent = {
  component: HighlightCard,
  name: "HightlightCard",
};
