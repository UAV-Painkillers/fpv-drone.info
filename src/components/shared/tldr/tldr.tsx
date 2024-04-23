import { component$ } from "@builder.io/qwik";
import type { TextProps } from "../text/text";
import { Text } from "../text/text";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";

export type TLDRProps = TextProps;

export const TLDR = component$<TLDRProps>((props) => {
  return (
    <>
      <h2>TL;DR;</h2>
      <Text {...props} />
    </>
  );
});

export const TLDRRegistryDefinition: CMSRegisteredComponent = {
  component: TLDR,
  name: "TLDR",
};
