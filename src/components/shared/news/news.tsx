import { component$ } from "@builder.io/qwik";
import { TLDR, type TLDRProps } from "../tldr/tldr";
import type { TextProps } from "../text/text";
import { Link } from "@builder.io/qwik-city";
import { Text } from "../text/text";
import styles from "./news.module.css";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

interface NewsProps {
  tldr: TLDRProps;
  content: TextProps;
  originalSource?: {
    url: string;
    label?: string;
  };
}

export const News = component$<NewsProps>((props) => {
  return (
    <div>
      {props.originalSource?.url && (
        <div class={styles.originalSource}>
          <span>Original Source: </span>
          <Link href={props.originalSource.url} class="anchor">
            {props.originalSource.label ?? "Original Source"}
          </Link>
        </div>
      )}
      <TLDR {...props.tldr} />
      <h2>Full Story</h2>
      <Text {...props.content} />
    </div>
  );
});

export const NewsRegistryDefinition: CMSRegisteredComponent = {
  component: News,
  name: "News",
};
