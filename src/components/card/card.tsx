/* eslint-disable qwik/jsx-img */
import { component$ } from "@builder.io/qwik";
import styles from "./card.module.css";
import { useNavigate } from "@builder.io/qwik-city";
import classNames from "classnames";

export enum CardVariant {
  small = "small",
  large = "large",
}

interface Props {
  title: string;
  description?: string;
  variant: CardVariant;
  headerImageUrl?: string;
  href?: string;
}

export const Card = component$((props: Props) => {
  const nav = useNavigate();
  const { title, description, variant, headerImageUrl, href } = props;

  return (
    <div
      class={classNames(styles.card, { [styles.withLink]: !!href })}
      onClick$={() => (href ? nav(href) : {})}
    >
      {headerImageUrl && (
        <img src={headerImageUrl} alt={title} class={styles.headerImage} />
      )}
      <h3 class={styles.title}>{title}</h3>
      {variant !== CardVariant.small && (
        <p class={styles.description}>{description}</p>
      )}
    </div>
  );
});
