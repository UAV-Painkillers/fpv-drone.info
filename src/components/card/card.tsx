/* eslint-disable qwik/jsx-img */
import { component$ } from "@builder.io/qwik";
import styles from "./card.module.css";
import { useNavigate } from "@builder.io/qwik-city";
import classNames from "classnames";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { srcToSrcSet } from "~/utils/srcToSrcSet";

export enum CardVariant {
  small = "small",
  large = "large",
}

interface Props {
  title: string;
  description?: string;
  variant: CardVariant;
  headerImageSrc?: string;
  headerImageSrcSet?: string;
  href?: string;
  isLoading?: boolean;
}

export const Card = component$((props: Props) => {
  const nav = useNavigate();
  const {
    title,
    description,
    variant,
    headerImageSrc,
    headerImageSrcSet: propHeaderImageSrcSet,
    href,
  } = props;
  const isLoading = props.isLoading ?? false;

  const headerImageSrcSet =
    propHeaderImageSrcSet ??
    (headerImageSrc ? srcToSrcSet(headerImageSrc) : undefined);

  return (
    <div
      class={classNames(
        styles.card,
        { [styles.withLink]: !!href },
        { [styles.isLoading]: isLoading }
      )}
      onClick$={() => (href ? nav(href) : {})}
    >
      {headerImageSrc && (
        <img
          loading="lazy"
          src={headerImageSrc}
          srcset={headerImageSrcSet}
          alt={title}
          class={styles.headerImage}
        />
      )}
      <h3 class={styles.title}>{title}</h3>
      {variant !== CardVariant.small && (
        <p class={styles.description}>{description}</p>
      )}
    </div>
  );
});

export const CardRegistryDefinition: RegisteredComponent = {
  component: Card,
  name: "Card",
  inputs: [
    {
      name: "variant",
      friendlyName: "Variant",
      type: "string",
      enum: Object.values(CardVariant),
      required: true,
    },
    {
      name: "title",
      friendlyName: "Title",
      type: "string",
      required: true,
    },
    {
      name: "description",
      friendlyName: "Description",
      type: "string",
      required: false,
    },
    {
      name: "headerImageSrc",
      friendlyName: "Header Image",
      type: "file",
      allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
      required: false,
    },
  ],
};
