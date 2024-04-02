import type { QRL } from "@builder.io/qwik";
import { component$, $ } from "@builder.io/qwik";
import RacoonCointImage from "./racoon_coin_cropped.png?jsx";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import {
  BuyMeACoffeButtonContentRenderer,
} from "../shared/buy-me-a-coffe/button";

interface Props {
  slug: string;
  text: string;
  icon?: QRL<() => JSX.Element>;
}
export const BuyMeARacoonButton = component$((props: Props) => {
  const getRacoonImage = $((className: string) => (
    <RacoonCointImage class={className} />
  ));
  return (
    <>
      {BuyMeACoffeButtonContentRenderer({
        text: props.text,
        slug: props.slug,
        icon: getRacoonImage,
      })}
    </>
  );
});

export const BuyMeARacoonButtonRegistryDefinition = (
  defaultSlug: string,
  defaultText: string
): RegisteredComponent => ({
  component: BuyMeARacoonButton,
  name: "BuyMeACoffe (Racoon) Button",
  inputs: [
    {
      name: "slug",
      friendlyName: "BMC Slug",
      type: "string",
      required: true,
      defaultValue: defaultSlug,
    },
    {
      name: "text",
      friendlyName: "Label",
      type: "string",
      required: true,
      defaultValue: defaultText,
    },
  ],
});
