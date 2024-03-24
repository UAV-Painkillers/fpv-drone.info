import { component$, useSignal, $ } from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

export const DynamicIdleCalculator = component$(() => {
  const dynamicIdle = useSignal(0);

  const onPropDiaChange = $((e: Event) => {
    const input = e.target as HTMLInputElement;
    const propDia = parseFloat(input.value);

    const dynIdleRpm = 15000 / propDia;
    dynamicIdle.value = Math.round(dynIdleRpm / 100);
  });

  return (
    <div>
      <label style={{display: 'block', marginBottom: '1rem'}}>
        Prop Diameter (inches)
        <input style={{display: 'block'}} type="number" min={0} onChange$={onPropDiaChange} />
      </label>

      <label style={{display: 'block'}}>
        Resulting Dynamic Idle
        <input style={{display: 'block'}} type="number" readOnly value={dynamicIdle.value} />
      </label>
    </div>
  );
});

export const DynamicIdleCalculatorRegistryDefinition: RegisteredComponent = {
  component: DynamicIdleCalculator,
  name: "DynamicIdleCalculator",
  friendlyName: "Dynamic Idle Calculator",
};
