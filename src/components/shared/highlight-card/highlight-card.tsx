import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { formatHtmlText } from "~/utils/formatHtmlText";
import styles from "./highlight-card.module.css";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { storyblokEditable, type SbBlokData, renderRichText } from "@storyblok/js";

interface Props {
  title?: string;
  content?: string;
}
export const HighlightCard = component$(
  (props: Props & IntrinsicElements["div"]) => {
    const { title, content, ...divProps } = props;
    const contentHtml = formatHtmlText(content ?? "");

    return (
      <div {...divProps} class={styles.tipCard}>
        <b>{title}:</b>
        <div dangerouslySetInnerHTML={contentHtml}></div>
      </div>
    );
  }
);

export const HighlightCardRegistryDefinition: CMSRegisteredComponent = {
  component: component$((blok: SbBlokData) => {
    return (
      <HighlightCard
        {...storyblokEditable(blok)}
        title={blok.title as string}
        content={renderRichText(blok.content as any)}
      />
    );
  }),
  name: "HighlightCard",
};
