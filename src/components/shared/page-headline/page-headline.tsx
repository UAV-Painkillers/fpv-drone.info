import { component$ } from "@builder.io/qwik";
import styles from "./page-headline.module.css";
import { Link } from "@builder.io/qwik-city";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

interface Props {
  title: string;
  subtitle?: string;
  backButtonHref?: string;
  backButtonLabel?: string;
}

export const PageHeadline = component$((props: Props) => {
  return (
    <>
      {(props.backButtonLabel || props.backButtonHref) && (
        <div style={{ marginTop: "-3rem", marginBottom: "3rem" }}>
          <Link
            href={props.backButtonHref}
            class="anchor"
            style={{ display: "inline-block" }}
          >
            &#10094;&nbsp;
            {!props.backButtonHref && "NO HREF SPECIFIED FOR BACK URL"}
            {props.backButtonLabel || "NO LABEL SPECIFIED FOR BACK URL"}
          </Link>
        </div>
      )}
      <header class={styles.container}>
        <h1 class={styles.title}>{props.title}</h1>
        {props.subtitle && <h2 class={styles.subtitle}>{props.subtitle}</h2>}
      </header>
    </>
  );
});

export const PageHeadlineRegistryDefinition: CMSRegisteredComponent = {
  component: PageHeadline,
  name: "PageHeadline",
};
