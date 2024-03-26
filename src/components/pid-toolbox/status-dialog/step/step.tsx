import { component$, useComputed$ } from "@builder.io/qwik";
import { AnalyzerStepStatus } from "../../hooks/types";
import { InlineSpinner } from "~/components/inline-spinner/inline-spinner";
import { Inset } from "~/components/inset/inset";

export interface StepProps {
  state: AnalyzerStepStatus;
  label: string;
  subSteps?: StepProps[];
  subStepsAllwaysVisible?: boolean;
}
export const Step = component$((props: StepProps) => {
  const showSubSteps = useComputed$(() => {
    if (!props.subSteps) {
      return false;
    }

    if (props.subSteps.length === 0) {
      return false;
    }

    if (props.subStepsAllwaysVisible) {
      return true;
    }

    if (props.state !== AnalyzerStepStatus.RUNNING) {
      return false;
    }

    return true;
  });

  return (
    <>
      <div>
        <InlineSpinner
          success={props.state === AnalyzerStepStatus.COMPLETE}
          error={props.state === AnalyzerStepStatus.ERROR}
          waiting={props.state === AnalyzerStepStatus.PENDING}
        />{" "}
        {props.label}
      </div>

      {showSubSteps.value && (
        <Inset>
          {props.subSteps?.map((subStep, index) => (
            <Step {...subStep} key={`${subStep.label}_${index}`} />
          ))}
        </Inset>
      )}
    </>
  );
});
