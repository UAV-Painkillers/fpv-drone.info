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
import { BlackboxAnalyzerRegistryDefinition } from "./tuning-tools/blackbox-analyzer";
import { BuyMeACoffeeButtonRegistryDefinition } from "./shared/buy-me-a-coffe/button";
import { CustomInstructionsRegistryDefinition } from "./shared/instructions/custom-instructions";
import { InstructionsStepRegistryDefinition } from "./shared/instructions/step/step";
import { HighlightCardRegistryDefinition } from "./shared/highlight-card/highlight-card";
import { DynamicIdleCalculatorRegistryDefinition } from "./tuning-tools/dynamic-idle-calculator/dynamic-idle-calculator";
import { SWClearCacheButtonRegistryDefinition } from "./sw-clear-cache-button/sw-clear-cache-button";
import { SponsorsListRegistryDefinition } from "./sponsors-list/sponsors-list";
import { BuyMeARacoonButtonRegistryDefinition } from "./buy-me-a-racoon/buy-me-a-racoon";
import type { CMSRegisteredComponent } from "./cms-registered-component";
import { ColumnsRegistryDefinition } from "./columns/columns";
import { CenteredRegistryDefinition } from "./centered/centered";
import { CSSBoxRegistryDefinition } from "./css-box/css-box";
import { CMSSnippetRegistryDefinition } from "./cms-snippet/cms-snippet";

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

export const CMSComponents: CMSRegisteredComponent[] = [
  PageGridRegistryDefinition,
  CardRegistryDefinition,
  InstructionsRegistryDefinition,
  CustomInstructionsRegistryDefinition,
  InstructionsStepRegistryDefinition,
  LogoRegistryInformation,
  PageHeadlineRegistryDefinition,
  ExpandableImageRegistryDefinition,
  TextRegistryDefinition,
  TLDRRegistryDefinition,
  NewsRegistryDefinition,
  ProductRegistryDefinition,
  BlackboxAnalyzerRegistryDefinition,
  BuyMeACoffeeButtonRegistryDefinition,
  BuyMeARacoonButtonRegistryDefinition,
  HighlightCardRegistryDefinition,
  DynamicIdleCalculatorRegistryDefinition,
  SWClearCacheButtonRegistryDefinition,
  SponsorsListRegistryDefinition,
  ColumnsRegistryDefinition,
  CenteredRegistryDefinition,
  CSSBoxRegistryDefinition,
  CMSSnippetRegistryDefinition,
];