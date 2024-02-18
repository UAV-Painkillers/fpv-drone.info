import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { Card, CardVariant } from "./card/card";
import { Logo } from "./logo/logo";
import { PageHeadline } from "./page-headline/page-headline";
import { ArticleGrid } from "./article-grid/article-grid";

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
  {
    component: Card,
    name: "Card",
    inputs: [
      {
        name: "variant",
        type: "string",
        enum: Object.values(CardVariant),
        required: true,
      },
      {
        name: "title",
        type: "string",
        required: true,
      },
      {
        name: "description",
        type: "string",
        required: false,
      },
      {
        name: "headerImageUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
        required: false,
      },
    ],
  },
  {
    component: Logo,
    name: "Logo",
    inputs: [],
  },
  {
    component: PageHeadline,
    name: "PageHeadline",
    inputs: [
      {
        name: "title",
        type: "string",
        required: true,
      },
      {
        name: "subtitle",
        type: "string",
        required: false,
      },
    ],
  },
  {
    component: ArticleGrid,
    name: "ArticleGrid",
    inputs: [
      {
        name: "articleType",
        type: "string",
        required: true,
      },
    ],
  },
];
