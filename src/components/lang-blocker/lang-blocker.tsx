import { Slot, component$, useComputed$ } from "@builder.io/qwik";
import { useStoryblok } from "~/routes/layout";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { storyblokEditable } from "@storyblok/js";
import { StoryBlokComponent } from "../storyblok/component";

interface Props {
  whitelist?: string[];
  blacklist?: string[];
}
export const LangBlocker = component$((props: Props) => {
  const story = useStoryblok();

  const show = useComputed$(() => {
    if (props.whitelist && props.whitelist.length > 0) {
      return props.whitelist.includes(story.value.language);
    }

    if (props.blacklist && props.blacklist.length > 0) {
      return !props.blacklist.includes(story.value.language);
    }

    return true;
  });

  if (!show.value) {
    return null;
  }

  return <Slot />;
});

export const LangBlockerRegistryDefintion: CMSRegisteredComponent = {
  name: "LangBlocker",
  component: (story: any) => {
    console.log(story);
    return (
      <LangBlocker
        whitelist={story.whitelist}
        blacklist={story.blacklist}
        {...storyblokEditable(story)}
      >
        {story.bloks.map((blok: any, index: number) => (
          <StoryBlokComponent key={index} blok={blok} />
        ))}
      </LangBlocker>
    );
  },
};
