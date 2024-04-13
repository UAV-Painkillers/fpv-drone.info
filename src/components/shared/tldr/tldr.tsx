import { component$ } from "@builder.io/qwik";
import type { TextProps } from "../text/text";
import { Text, TextRegistryDefinition } from "../text/text";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";

export type TLDRProps = TextProps;

export const TLDR = component$<TLDRProps>((props) => {
  return (
    <>
      <h2>TL;DR;</h2>
      <Text {...props} />
    </>
  );
});

export const TLDRRegistryDefinition: RegisteredComponent = {
  component: TLDR,
  name: "TLDR",
  inputs: TextRegistryDefinition.inputs,
};
