/* eslint-disable qwik/jsx-img */
import type { QwikIntrinsicElements, QRL } from "@builder.io/qwik";
import { Slot, component$ } from "@builder.io/qwik";
import styles from "./card.module.css";
import { Link } from "@builder.io/qwik-city";
import classNames from "classnames";
import { srcToSrcSet } from "../../../utils/srcToSrcSet";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { storyblokEditable } from "@storyblok/js";
import { useStoryblokURL } from "../utils/url";

export enum CardVariant {
  small = "small",
  large = "large",
}

interface WrapperProps {
  href?: string;
}
const WrapperComponent = component$(
  (props: WrapperProps & QwikIntrinsicElements["div"]) => {
    const { href, ...rest } = props;

    if (href) {
      return (
        <Link href={href} {...(rest as any)}>
          <Slot />
        </Link>
      );
    }

    return (
      <div {...rest}>
        <Slot />
      </div>
    );
  },
);

export interface CardProps {
  title: string;
  description?: string;
  variant: CardVariant;
  headerImageSrc?: string;
  headerImageSrcSet?: string;
  headerImageObjectFit?: "cover" | "contain";
  href?: string;
  isLoading?: boolean;
  onClick$?: QRL<() => any>;
}
export const Card = component$(
  (props: CardProps & QwikIntrinsicElements["div"]) => {
    const {
      title,
      description,
      variant,
      headerImageSrc,
      headerImageSrcSet: propHeaderImageSrcSet,
      headerImageObjectFit,
      href,
      onClick$,
      ...divProps
    } = props;

    const isLoading = props.isLoading ?? false;

    const headerImageSrcSet =
      propHeaderImageSrcSet ??
      (headerImageSrc ? srcToSrcSet(headerImageSrc) : undefined);

    return (
      <WrapperComponent
        {...divProps}
        class={classNames(
          styles.card,
          { [styles.withLink]: !!href },
          { [styles.isLoading]: isLoading },
        )}
        href={href}
        onClick$={onClick$}
      >
        {headerImageSrc && (
          <img
            loading="lazy"
            src={headerImageSrc}
            srcset={headerImageSrcSet}
            alt={title}
            class={styles.headerImage}
            style={{ objectFit: headerImageObjectFit ?? "cover" }}
          />
        )}
        <h3 class={styles.title}>{title}</h3>
        {variant !== CardVariant.small && (
          <p class={styles.description}>{description}</p>
        )}
      </WrapperComponent>
    );
  },
);

export const CardRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData: any) => {
    const { headerImage, href, ...cardProps } = storyData;

    const actualURL = useStoryblokURL(href);

    return (
      <Card
        {...storyblokEditable(storyData)}
        {...cardProps}
        headerImageSrc={headerImage.filename}
        href={actualURL.value}
      />
    );
  }),
  name: "Card",
};
