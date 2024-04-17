import { component$ } from "@builder.io/qwik";
import type { FunctionComponent } from "@builder.io/qwik";
import type { StoryblokComponentType } from "@storyblok/js";

interface Props {
  blok: StoryblokComponentType<string>;
}

type TagName = string;
type ComponentConstructor = FunctionComponent<any>;
const Components: Record<TagName, ComponentConstructor> = {};

export const StoryBlokComponent = component$<Props>((props) => {
  const Component = Components[`sb-${props.blok.component}`];
  return <Component blok={props.blok} />;
});
