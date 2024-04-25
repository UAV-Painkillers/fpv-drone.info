import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useSignal, $ } from "@builder.io/qwik";
import type { SbBlokData } from "@storyblok/js";
import { storyblokEditable } from "@storyblok/js";
import { inlineTranslate } from "qwik-speak";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

export const DynamicIdleCalculator = component$(
  (props: IntrinsicElements["div"]) => {
    const dynamicIdle = useSignal(0);
    const t = inlineTranslate();

    const onPropDiaChange = $((e: Event) => {
      const input = e.target as HTMLInputElement;
      const propDia = parseFloat(input.value);

      const dynIdleRpm = 15000 / propDia;
      dynamicIdle.value = Math.round(dynIdleRpm / 100);
    });

    const propSizeInputLabel = t("dynamicIdleCalculator.propSizeInput.label");
    const dynamicIdleResultLabel = t(
      "dynamicIdleCalculator.dynamicIdleResult.label"
    );

    return (
      <div {...props}>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          {propSizeInputLabel}
          <input
            style={{ display: "block" }}
            type="number"
            min={0}
            onInput$={onPropDiaChange}
          />
        </label>

        <label style={{ display: "block" }}>
          {dynamicIdleResultLabel}
          <input
            style={{ display: "block" }}
            type="number"
            readOnly
            value={dynamicIdle.value}
          />
        </label>
      </div>
    );
  }
);

export const DynamicIdleCalculatorRegistryDefinition: CMSRegisteredComponent = {
  component: component$((blok: SbBlokData) => {
    return <DynamicIdleCalculator {...storyblokEditable(blok)} />;
  }),
  name: "DynamicIdleCalculator",
};
