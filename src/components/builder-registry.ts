import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { ArticleGridRegistryDefinition } from "./page-grid/page-grid";
import { CardRegistryDefinition } from "./card/card";
import { InstructionsRegistryInformation } from "./instructions/instructions";
import { LogoRegistryInformation } from "./logo/logo";
import { PageHeadlineRegistryDefinition } from "./page-headline/page-headline";
import { ExpandableImageRegistryDefinition } from "./expandable-image/expandable-image";
import { TextRegistryDefinition } from "./text/text";
import { TLDRRegistryDefinition } from "./tldr/tldr";
import { NewsRegistryDefinition } from "./news/news";
import { ProductRegistryDefinition } from "./product/product";

/**
 * This array is used to integrate custom components within Builder.
 * https://www.builder.io/c/docs/custom-components-intro
 *
 * These components will be found the "Custom Components"
 * section of Builder's visual editor.
 * You can also turn on "components only mode" to limit
 * editing to only these components.
 * https://www.builder.io/c/docs/guides/components-only-mode
 */

export const CUSTOM_COMPONENTS: RegisteredComponent[] = [
  ArticleGridRegistryDefinition,
  CardRegistryDefinition,
  InstructionsRegistryInformation,
  LogoRegistryInformation,
  PageHeadlineRegistryDefinition,
  ExpandableImageRegistryDefinition,
  TextRegistryDefinition,
  TLDRRegistryDefinition,
  NewsRegistryDefinition,
  ProductRegistryDefinition,
];
