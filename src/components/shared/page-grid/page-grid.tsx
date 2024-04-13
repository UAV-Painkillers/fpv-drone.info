import {
  Resource,
  component$,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import type { CardProps } from "../card/card";
import { Card, CardVariant } from "../card/card";
import type { BuilderContent, RegisteredComponent } from "@builder.io/sdk-qwik";
import { fetchEntries } from "@builder.io/sdk-qwik";
import { Link } from "@builder.io/qwik-city";
import { CardGrid, CardGridRow, CardGridRowVariant } from "../card/card-grid";

enum PageType {
  Page = "page",
  Guide = "guide",
  Product = "product",
  Tool = "tool",
}

interface PageGridProps {
  pageType: PageType;
  title?: string;
  hideTitleIfEmpty?: boolean;
  href?: string;
}

const LoadingState = component$(() => {
  return (
    <CardGridRow variant={CardGridRowVariant.one}>
      <Card title="" variant={CardVariant.large} isLoading />
      <Card title="" variant={CardVariant.small} isLoading />
      <Card title="" variant={CardVariant.small} isLoading />
    </CardGridRow>
  );
});

export const PageGrid = component$((props: PageGridProps) => {
  const showTitle = useSignal(!!props.title);
  const hideTitleIfEmpty = props.hideTitleIfEmpty ?? false;

  const matches = useResource$(() =>
    fetchEntries({
      model: "page",
      apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
      query: {
        data: {
          type: props.pageType,
        },
      },
    }).then((pages) => {
      if (pages?.length === 0 && hideTitleIfEmpty) {
        showTitle.value = false;
      }

      const rows: Array<BuilderContent[]> = [];

      pages?.forEach((page, index) => {
        if (index % 3 === 0) {
          rows.push([]);
        }
        rows[rows.length - 1].push(page);
      });

      return rows;
    }),
  );

  const TitleSlot =
    showTitle.value &&
    (props.href ? (
      <Link class="anchor" href={props.href}>
        {props.title}
      </Link>
    ) : (
      <span>{props.title}</span>
    ));

  return (
    <Resource
      value={matches}
      onPending={() => <LoadingState />}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={(rows) => (
        <CardGrid
          rows={rows.map((row) =>
            row.map(
              (page) =>
                ({
                  title: page.data?.title ?? "",
                  headerImageSrc: page.data?.previewImage,
                  description: page.data?.description,
                  href: page.data?.url,
                  headerImageObjectFit: page.data?.previewImageObjectFit,
                }) as CardProps,
            ),
          )}
        >
          <div q:slot="title">{TitleSlot}</div>
        </CardGrid>
      )}
    />
  );
});

export const PageGridRegistryDefinition: RegisteredComponent = {
  component: PageGrid,
  name: "PageGrid",
  inputs: [
    {
      name: "pageType",
      friendlyName: "Type",
      type: "string",
      enum: Object.values(PageType),
      required: true,
    },
    {
      name: "title",
      friendlyName: "Title",
      type: "string",
      required: false,
    },
    {
      name: "hideTitleIfEmpty",
      friendlyName: "Hide if title is empty?",
      type: "boolean",
      required: false,
    },
    {
      name: "href",
      friendlyName: "href",
      type: "string",
      required: false,
    },
  ],
};
