import { component$ } from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { StepResponse } from "./step-response";

export const PIDToolbox = component$(() => {
  return (
    <div>
      <StepResponse />
    </div>
  );
});

export const PIDToolboxRegistryDefinition: RegisteredComponent = {
  component: PIDToolbox,
  name: "PIDToolbox",
  inputs: [],
};
