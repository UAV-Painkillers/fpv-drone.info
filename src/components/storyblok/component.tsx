import { component$ } from "@builder.io/qwik";
import type { FunctionComponent } from "@builder.io/qwik";
import type { SbBlokData } from "@storyblok/js";
import { storyblokEditable, type StoryblokComponentType } from "@storyblok/js";
import { CMSComponents } from "../cms-components";
import kebabCase from "lodash-es/kebabCase";

interface Props {
  blok: StoryblokComponentType<string>;
}

type TagName = string;
type ComponentConstructor = FunctionComponent<any>;
const Components: Record<TagName, ComponentConstructor> = Object.fromEntries(
  CMSComponents.map((componentRegistration) => {
    const tag = kebabCase(componentRegistration.name);
    return [tag, componentRegistration.component];
  }),
);

export const StoryBlokComponent = component$<Props>((props) => {
  const Component = Components[props.blok.component as string];
  return (
    <Component
      {...storyblokEditable(props.blok as SbBlokData)}
      {...props.blok}
    />
  );
});
