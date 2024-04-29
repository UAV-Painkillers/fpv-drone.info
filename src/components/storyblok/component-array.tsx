import { component$ } from "@builder.io/qwik";
import type { StoryblokComponentType } from "@storyblok/js";
import { StoryBlokComponent } from "./component";

interface Props {
  bloks?: Array<StoryblokComponentType<string>>;
}
export const StoryBlokComponentArray = component$((props: Props) => {
  return (
    <>
      {(props.bloks ?? []).map((blok, index) => {
        return <StoryBlokComponent key={index} blok={blok} />;
      })}
    </>
  );
});
