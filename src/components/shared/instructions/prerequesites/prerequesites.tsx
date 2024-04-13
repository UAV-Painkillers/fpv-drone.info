import { component$ } from "@builder.io/qwik";
import styles from "./prerequesites.module.css";
import classNames from "classnames";
import { ExpandableImage } from "../../expandable-image/expandable-image";

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
      <div
        class={classNames(
          { [styles.contentContainer]: !!props.image },
          { [styles.contentContainerNoImage]: !props.image },
        )}
      >
        {
          // eslint-disable-next-line qwik/jsx-img
          props.image && (
            <ExpandableImage
              class={styles.image}
              alt="Prerequesistes"
              src={props.image}
            />
          )
        }
        <ul class={styles.list}>
          {props.items.map((item, index) => (
            <li key={`prerequesite-${index}`} class={styles.listItem}>
              <label class={classNames("clickable", styles.labelContainer)}>
                <input
                  type="checkbox"
                  class={classNames(styles.checkbox, {
                    [styles.checkboxNoImage]: !props.image,
                  })}
                />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});
