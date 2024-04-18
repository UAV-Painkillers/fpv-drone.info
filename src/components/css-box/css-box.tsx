import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useComputed$ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { StoryBlokComponentArray } from "../storyblok/component-array";
import { storyblokEditable } from "@storyblok/js";

export const CSSBox = component$((props: IntrinsicElements['div']) => {
  return (
    <div {...props}>
      <Slot />
    </div>
  );
});

export const CSSBoxRegistryDefinition: CMSRegisteredComponent = {
  name: "CSS Box",
  component: component$((storyData: any) => {
    const { items, className, ...styles } = storyData;

    return (
      <CSSBox class={className} style={styles} {...storyblokEditable(storyData)}>
        <StoryBlokComponentArray bloks={items} />
      </CSSBox>
    );
  }),
};
