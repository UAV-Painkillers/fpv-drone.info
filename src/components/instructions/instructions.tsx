import { component$ } from "@builder.io/qwik";
import { Step, type StepProps } from "./step/step";
import type { PrerequesitesProps } from "./prerequesites/prerequesites";
import { Prerequesites } from "./prerequesites/prerequesites";
import styles from "./instructions.module.css";

interface Props {
  prerequesites: PrerequesitesProps;
  steps?: StepProps[];
}
export const Instructions = component$<Props>((props) => {
  return (
    <article>
      <Prerequesites {...props.prerequesites} class={styles.prerequesites} />
      <hr />
      {props.steps?.map((step, index) => (
        <>
          <Step key={`step-${index}`} {...step} index={index + 1} />
          {index < (props.steps?.length ?? 0) - 1 && <hr />}
        </>
      ))}
    </article>
  );
});
