import { component$ } from "@builder.io/qwik";
import { TLDR, TLDRRegistryDefinition, type TLDRProps } from "../tldr/tldr";
import type { TextProps } from "../text/text";
import { Link } from "@builder.io/qwik-city";
import { Text, TextRegistryDefinition } from "../text/text";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import styles from "./news.module.css";

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

export const NewsRegistryDefinition: RegisteredComponent = {
  component: News,
  name: "News",
  inputs: [
    {
      name: "originalSource",
      friendlyName: "Original Source",
      type: "object",
      required: false,
      subFields: [
        {
          name: "url",
          type: "url",
          required: true,
        },
        {
          name: "label",
          type: "text",
          required: false,
        },
      ],
    },
    {
      name: "tldr",
      friendlyName: "TL;DR;",
      type: "object",
      required: true,
      subFields: TLDRRegistryDefinition.inputs,
    },
    {
      name: "content",
      friendlyName: "Content",
      type: "object",
      required: true,
      subFields: TextRegistryDefinition.inputs,
    },
  ],
};
