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
  RequestHandler,
  StaticGenerateHandler,
} from "@builder.io/qwik-city";
import { loadStoryblokBridge, type ISbStoryData } from "@storyblok/js";
import { StoryBlokComponentArray } from "~/components/storyblok/component-array";
import { useStory, useStoryblok } from "../layout";
import { getAllPageStories } from "../../utils/storyblok";
import { useStoryblokURL } from "~/components/shared/utils/url";
import { config as speakConfig } from "../../speak";
import { PageHeadline } from "~/components/shared/page-headline/page-headline";

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
    }),
  );

  const backButtonHref = useStoryblokURL(story.value?.content.backButtonHref);

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
        backButtonHref={backButtonHref.value}
        backButtonLabel={story.value.content.backButtonLabel}
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

export const head: DocumentHead = ({ resolveValue, url }) => {
  const story = resolveValue(useStory);
  const { language } = resolveValue(useStoryblok);

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
      content: `${url.origin}/api/stories/${story.id}/lang/${language}/open-graph`,
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
      content: url.href,
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

  const params: Array<Record<string, string>> = [];

  speakConfig.supportedLocales.forEach((locale) => {
    params.push({
      index: locale.lang,
    });

    allStories.forEach((story) => {
      params.push({
        index: story.full_slug,
      });

      params.push({
        index: `${locale.lang}/${story.full_slug}`,
      });
    });
  });

  return {
    params,
  };
};
