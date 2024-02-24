import { component$ } from "@builder.io/qwik";
import styles from "./prerequesites.module.css";
import { ExpandableImage } from "~/components/expandable-image/expandable-image";
import classNames from "classnames";

export interface PrerequesitesProps {
  class?: string;
  title?: string;
  items: Array<{ label: string }>;
  image?: string;
}
export const Prerequesites = component$<PrerequesitesProps>((props) => {
  return (
    <section class={props.class}>
      <h2 class={styles.title}>
        {props.title ? props.title : "Prerequesites"}
      </h2>
      <div class={styles.contentContainer}>
        {
          // eslint-disable-next-line qwik/jsx-img
          props.image && (
            <ExpandableImage
              class={styles.image}
              src={props.image}
            />
          )
        }
        <ul class={styles.list}>
          {props.items.map((item, index) => (
            <li key={`prerequesite-${index}`} class={styles.listItem}>
              <label class={classNames("clickable", styles.labelContainer)}>
                <input type="checkbox" class={styles.checkbox} />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});
