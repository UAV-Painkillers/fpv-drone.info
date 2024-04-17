/* eslint-disable qwik/jsx-img */
import { component$ } from "@builder.io/qwik";
import type {
  DocumentHead,
  DocumentLink,
  RequestHandler,
} from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PageHeadline } from "~/components/shared/page-headline/page-headline";
import type { ISbStoryData } from "@storyblok/js";
import { storyblokApi } from "~/routes/plugin@storyblok";
import { StoryBlokComponentArray } from "~/components/storyblok/component-array";

export const useRouteURL = routeLoader$(async ({ url }) => {
  return url;
});

export const useStory = routeLoader$(async ({ url }) => {
  if (!storyblokApi)
    throw new Error("Not Storyblok plugin found to make the API calls");

  let slug = url.pathname;
  if (slug === "/") {
    slug = "home";
  }

  const { data } = await storyblokApi
    .getStory(slug, {
      version: "published",
      // TODO: figure out how to get the language from the request
      language: "en",
    })
    .catch((e) => {
      console.error("Error fetching story", e);
      return { data: { story: null } };
    });

  return data.story as ISbStoryData;
});

export default component$(() => {
  const story = useStory();

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
        subtitle={story.value.content.description}
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
  ];

  return {
    title: story.content.title,
    links,
    meta,
  };
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
