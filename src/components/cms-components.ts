import { ProductRegistryDefinition } from "./product/product";
import { LogoRegistryDefinition } from "./logo/logo";
import { CardRegistryDefinition } from "./card/card";
import { ExpandableImageRegistryDefinition } from "./expandable-image/expandable-image";
import { InstructionsRegistryDefinition } from "./instructions/instructions";
import { NewsRegistryDefinition } from "./news/news";
import { PageGridRegistryDefinition } from "./page-grid/page-grid";
import { PageHeadlineRegistryDefinition } from "./page-headline/page-headline";
import { TextRegistryDefinition } from "./text/text";
import { TLDRRegistryDefinition } from "./tldr/tldr";
import { BlackboxAnalyzerRegistryDefinition } from "./tuning-tools/blackbox-analyzer";
import { BuyMeACoffeeButtonRegistryDefinition } from "./buy-me-a-coffe/button";
import { HighlightCardRegistryDefinition } from "./highlight-card/highlight-card";
import { DynamicIdleCalculatorRegistryDefinition } from "./tuning-tools/dynamic-idle-calculator/dynamic-idle-calculator";
import { SWClearCacheButtonRegistryDefinition } from "./sw-clear-cache-button/sw-clear-cache-button";
import { SponsorsListRegistryDefinition } from "./sponsors-list/sponsors-list";
import { BuyMeARacoonButtonRegistryDefinition } from "./buy-me-a-racoon/buy-me-a-racoon";
import type { CMSRegisteredComponent } from "./cms-registered-component";
import { ColumnsRegistryDefinition } from "./columns/columns";
import { CenteredRegistryDefinition } from "./centered/centered";
import { CSSBoxRegistryDefinition } from "./css-box/css-box";
import { CMSSnippetRegistryDefinition } from "./cms-snippet/cms-snippet";
import { LangBlockerRegistryDefintion as LangBlockerRegistryDefinition } from "./lang-blocker/lang-blocker";

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
  LogoRegistryDefinition,
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
  LangBlockerRegistryDefinition,
];
