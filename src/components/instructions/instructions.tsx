import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useComputed$ } from "@builder.io/qwik";
import {
  Prerequesites,
  type PrerequesitesProps,
} from "./prerequesites/prerequesites";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { InstructionsStep } from "./step/step";
import { StoryBlokComponentArray } from "~/components/storyblok/component-array";
import { renderRichText, storyblokEditable } from "@storyblok/js";

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
  },
);

export const InstructionsRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData) => {
    const prerequesites = useComputed$(() => {
      return {
        title: storyData.prerequisitesTitle,
        image: storyData.prerequisitesImage?.filename,
        items: storyData.prerequisitesItems.map((item: any) => ({
          ...storyblokEditable(item),
          ...item,
        })),
      } as Props["prerequesites"];
    });

    const steps = useComputed$(() => {
      return storyData.steps?.map((step: any) => {
        const [sourceStep] = step.sourceStep ?? [];
        const [sourceStepContent] = sourceStep?.content?.items ?? [];

        if (!sourceStepContent) {
          return {
            ...step,
            image: step.image.filename,
          };
        }

        return {
          ...step,
          title: sourceStepContent.title,
          description: sourceStepContent.description,
          image: sourceStepContent.image.filename,
          customBloks: sourceStepContent.bloks,
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
            index={step.index}
            key={stepIndex}
            title={step.title}
            description={
              step.description ? renderRichText(step.description) : ""
            }
            image={step.image}
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
