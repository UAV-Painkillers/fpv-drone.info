import {
  Resource,
  component$,
  useContext,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import type { CardProps } from "../card/card";
import { Card, CardVariant } from "../card/card";
import { Link } from "@builder.io/qwik-city";
import { CardGrid, CardGridRow, CardGridRowVariant } from "../card/card-grid";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";
import { StoryblokContext } from "~/routes/[...index]/storyblok.ctx";
import type { ISbStoryData } from "@storyblok/js";
import { useSpeakLocale } from "qwik-speak";

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
  const storyblokContext = useContext(StoryblokContext);
  const showTitle = useSignal(!!props.title);
  const hideTitleIfEmpty = props.hideTitleIfEmpty ?? false;
  const locale = useSpeakLocale();

  const matches = useResource$(async () => {
    const { data } = await getStoryBlokApi()
      .getStories({
        version: storyblokContext.versionToLoad,
        language: locale.lang,
        content_type: "page",
        filter_query: {
          type: { in: props.pageType },
        },
      })
      .catch((e) => {
        console.error(
          "Error fetching stories for page grid",
          props.pageType,
          e,
        );
        throw e;
      });

    const pages = data.stories as ISbStoryData[];

    if (pages.length === 0 && hideTitleIfEmpty) {
      showTitle.value = false;
    }

    const rows: Array<ISbStoryData[]> = [];

    pages.forEach((page, index) => {
      if (index % 3 === 0) {
        rows.push([]);
      }
      rows[rows.length - 1].push(page);
    });

    return rows;
  });

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
                  title: page.content.title ?? "",
                  headerImageSrc: page.content.previewImage,
                  description: page.content.description,
                  href: page.content.url,
                  headerImageObjectFit: page.content.previewImageObjectFit,
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

export const PageGridRegistryDefinition: CMSRegisteredComponent = {
  component: PageGrid,
  name: "PageGrid",
};
