import type { IntrinsicElements} from "@builder.io/qwik";
import { Slot, component$ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { StoryBlokComponentArray } from "../storyblok/component-array";
import { storyblokEditable } from "@storyblok/js";

export const Centered = component$((props: IntrinsicElements["div"]) => {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Slot />
    </div>
  );
});

export const CenteredRegistryDefinition: CMSRegisteredComponent = {
  name: "Centered",
  component: component$((storyData) => {
    return (
      <Centered {...storyblokEditable(storyData)}>
        <StoryBlokComponentArray bloks={storyData.items} />
      </Centered>
    );
  }),
};
