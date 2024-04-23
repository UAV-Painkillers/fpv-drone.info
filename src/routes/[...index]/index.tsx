/* eslint-disable qwik/jsx-img */
import {
  $,
  component$,
  useOnWindow,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type {
  DocumentHead,
  DocumentHeadValue,
  DocumentLink,
  PathParams,
  RequestHandler,
  StaticGenerateHandler,
} from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PageHeadline } from "~/components/shared/page-headline/page-headline";
import { loadStoryblokBridge, type ISbStoryData } from "@storyblok/js";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";
import { StoryBlokComponentArray } from "~/components/storyblok/component-array";
import { useStoryBlokPreviewInformation } from "../layout";
import { getAllPageStories } from "~/utils/storyblok";

export const useRouteURL = routeLoader$(async ({ url }) => {
  return url;
});

export const useStory = routeLoader$(async ({ resolveValue }) => {
  const { versionToLoad, language, slug } = await resolveValue(
    useStoryBlokPreviewInformation
  );

  const { data } = await getStoryBlokApi()
    .getStory(slug, {
      version: versionToLoad,
      language,
      resolve_relations: [
        "*",
        "cms-snippet.reference",
        "instruction-step-item.sourceStep",
      ],
    })
    .catch((e) => {
      console.error("Error fetching story for page", slug, e);
      return { data: { story: null } };
    });

  return data.story as ISbStoryData | null;
});

export default component$(() => {
  const loadedStory = useStory();
  const story = useSignal(loadedStory.value);

  useTask$(({ track }) => {
    track(loadedStory);

    story.value = loadedStory.value;
  });

  useOnWindow(
    "load",
    $(async () => {
      await loadStoryblokBridge();
      const { StoryblokBridge, location } = window;
      const storyblokInstance = new StoryblokBridge();
      storyblokInstance.on(["published", "change"], () => {
        location.reload();
      });
      storyblokInstance.on("input", (event) => {
        story.value = event?.story as ISbStoryData;
      });
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!story.value) {
    return (
      <>
        <PageHeadline title="404" subtitle="Page not found" />
        <img
          src="/images/racoon_fire_error.gif"
          alt="Racoon Fire Error"
          height="878"
          width="800"
          style={{
            maxHeight: "50vh",
            maxWidth: "70vw",
            width: "auto",
            height: "auto",
            margin: "0 auto",
            display: "block",
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeadline
        title={story.value.content.title ?? ""}
        subtitle={story.value.content.subtitle}
      />

      {story.value.content.bloks && (
        <StoryBlokComponentArray
          key={story.value.id}
          bloks={story.value.content.bloks}
        />
      )}
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const story = resolveValue(useStory);
  const location = resolveValue(useRouteURL);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!story) {
    return {
      title: "404 - Page not found",
    };
  }

  const links: DocumentLink[] = [];

  const meta = [
    {
      property: "og:image",
      content: `${location.origin}/api/open-graph?builder-io-id=${story.id}`,
    },
    {
      property: "og:title",
      content: story.content.ogTitle,
    },
    {
      property: "og:description",
      content: story.content.ogDescription,
    },
    {
      property: "og:url",
      content: location.href,
    },
    {
      property: "description",
      content: story.content.description,
    },
  ];

  return {
    title: story.content.title,
    links,
    meta,
  } as DocumentHeadValue;
};

const VERCEL_ANALYTICS_PATH = "/_vercel/insights/";
export const onRequest: RequestHandler = async ({
  next,
  url,
  getWritableStream,
}) => {
  const isAnalyticsRequest = url.pathname.startsWith(VERCEL_ANALYTICS_PATH);

  if (!isAnalyticsRequest) {
    return next();
  }

  // forward it to the Vercel analytics endpoint
  const response = await fetch(url);

  const writableStream = getWritableStream();
  const reader = response.body?.getReader();

  if (!reader) {
    return;
  }

  const writer = writableStream.getWriter();

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      await writer.write(value);
    }
  } finally {
    writer.close();
    reader.releaseLock();
  }
};

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const allStories = await getAllPageStories();

  return {
    params: allStories.map((story) => {
      let index = story.full_slug;

      if (index === 'home') {
        index = '';
      }

      return { index } as PathParams;
    }),
  };
};
