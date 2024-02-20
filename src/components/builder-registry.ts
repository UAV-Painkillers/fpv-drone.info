import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { ArticleGrid } from "./article-grid/article-grid";
import { Card, CardVariant } from "./card/card";
import { Instructions } from "./instructions/instructions";
import { Logo } from "./logo/logo";
import { PageHeadline } from "./page-headline/page-headline";
import { ExpandableImage } from "./expandable-image/expandable-image";

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
    component: Instructions,
    name: "Instructions",
    inputs: [
      {
        name: "prerequesites",
        type: "object",
        required: true,
        subFields: [
          {
            name: "title",
            type: "string",
            required: false,
          },
          {
            name: "items",
            type: "list",
            required: true,
            subFields: [
              {
                name: "label",
                type: "string",
                required: true,
              },
            ],
          },
          {
            name: "image",
            type: "file",
            required: true,
            allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
          },
        ],
      },
      {
        name: "steps",
        type: "list",
        required: true,
        subFields: [
          {
            name: "title",
            type: "string",
            required: true,
          },
          {
            name: "image",
            type: "file",
            required: false,
            allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
          },
          {
            name: "description",
            type: "richText",
            required: true,
          },
        ],
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
    component: ExpandableImage,
    name: "ExpandableImage",
    inputs: [
      {
        name: "src",
        type: "file",
        required: true,
        allowedFileTypes: ["jpeg", "png", "jpg", "svg", "gif", "webp"],
      },
      {
        name: "alt",
        type: "string",
        required: true,
      },
      {
        name: "width",
        type: "number",
        required: true,
      },
      {
        name: "height",
        type: "number",
        required: true,
      },
    ],
  },
];
