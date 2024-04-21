import type { IntrinsicElements } from "@builder.io/qwik";
import {
  Slot,
  component$,
  useComputed$,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  Prerequesites,
  type PrerequesitesProps,
} from "./prerequesites/prerequesites";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { InstructionsStep } from "./step/step";
import { StoryBlokComponentArray } from "~/components/storyblok/component-array";
import { renderRichText, storyblokEditable } from "@storyblok/js";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";

interface Props {
  prerequesites?: PrerequesitesProps;
}
export const Instructions = component$(
  (props: Props & IntrinsicElements["article"]) => {
    const { prerequesites, ...articleProps } = props;
    return (
      <article {...articleProps}>
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {(prerequesites?.items?.length ?? 0) > 0 && (
          <>
            <Prerequesites {...prerequesites!} />
          </>
        )}
        <Slot />
      </article>
    );
  }
);

export const InstructionsRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData) => {
    const prerequesites = useComputed$(() => {
      return {
        title: storyData.prerequisitesTitle,
        image: storyData.prerequisitesImage?.filename,
        items: storyData.prerequisitesItems,
      } as Props["prerequesites"];
    });

    const steps = useComputed$(() => {
      return storyData.steps?.map((step: any) => {
        const [sourceStep] = step.sourceStep ?? [];
        const [sourceStepContent] = sourceStep?.content?.items ?? [];
        return {
          ...step,
          title: step.title || sourceStepContent?.title,
          description: step.description || sourceStepContent?.description,
          image: step.image?.filename || sourceStepContent?.image,
          customBloks: step.customBloks || sourceStepContent?.customBloks,
        };
      });
    });

    return (
      <Instructions
        {...storyblokEditable(storyData)}
        prerequesites={prerequesites.value}
      >
        {steps.value?.map((step: any, stepIndex: number) => (
          <InstructionsStep
            {...storyblokEditable(step)}
            index={stepIndex + 1}
            key={stepIndex}
            title={step.title}
            description={
              step.description ? renderRichText(step.description) : ""
            }
            image={step.image?.filename}
          >
            {step.customBloks && (
              <StoryBlokComponentArray bloks={step.customBloks} />
            )}
          </InstructionsStep>
        ))}
      </Instructions>
    );
  }),
  name: "Instructions",
};
