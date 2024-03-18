import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { ProductRegistryDefinition } from "./product/product";
import { LogoRegistryInformation } from "./logo/logo";
import { CardRegistryDefinition } from "./shared/card/card";
import { ExpandableImageRegistryDefinition } from "./shared/expandable-image/expandable-image";
import { InstructionsRegistryDefinition } from "./shared/instructions/instructions";
import { NewsRegistryDefinition } from "./shared/news/news";
import { PageGridRegistryDefinition } from "./shared/page-grid/page-grid";
import { PageHeadlineRegistryDefinition } from "./shared/page-headline/page-headline";
import { TextRegistryDefinition } from "./shared/text/text";
import { TLDRRegistryDefinition } from "./shared/tldr/tldr";
import { PIDToolboxRegistryDefinition } from "./pid-toolbox/pid-toolbox";
import { PWAInstallButtonRegistryDefinition } from "./pwa-install-button/pwa-install-button";

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
  PageGridRegistryDefinition,
  CardRegistryDefinition,
  InstructionsRegistryDefinition,
  LogoRegistryInformation,
  PageHeadlineRegistryDefinition,
  ExpandableImageRegistryDefinition,
  TextRegistryDefinition,
  TLDRRegistryDefinition,
  NewsRegistryDefinition,
  ProductRegistryDefinition,
  PIDToolboxRegistryDefinition,
  PWAInstallButtonRegistryDefinition,
];
