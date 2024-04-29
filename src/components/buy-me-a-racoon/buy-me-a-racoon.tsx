import type { QRL } from "@builder.io/qwik";
import { component$, $ } from "@builder.io/qwik";
import RacoonCointImage from "./racoon_coin_cropped.png?jsx";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import { BuyMeACoffeButtonContentRenderer } from "../shared/buy-me-a-coffe/button";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { storyblokEditable } from "@storyblok/js";

interface Props {
  slug: string;
  label: string;
  icon?: QRL<() => JSX.Element>;
}
export const BuyMeARacoonButton = component$((props: Props) => {
  const getRacoonImage = $((className: string) => (
    <RacoonCointImage class={className} />
  ));

  return (
    <>
      {BuyMeACoffeButtonContentRenderer({
        ...props,
        text: props.label,
        slug: props.slug,
        icon: getRacoonImage,
      })}
    </>
  );
});

export const BuyMeARacoonButtonRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData: any) => {
    return (
      <BuyMeARacoonButton {...storyblokEditable(storyData)} {...storyData} />
    );
  }),
  name: "BuyMeARacoonButton",
};
