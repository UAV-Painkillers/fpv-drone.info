import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  getContent,
  RenderContent,
  getBuilderSearchParams,
} from "@builder.io/sdk-qwik";
import { CUSTOM_COMPONENTS } from "../../components/builder-registry";
import { PageHeadline } from "~/components/page-headline/page-headline";

// This page is a catch-all for all routes that don't have a pre-defined route.
// Using a catch-all route allows you to dynamically create new pages in Builder.

// Use the `useBuilderContent` route loader to get your content from Builder.
// `routeLoader$()` takes an async function to fetch content
// from Builder with using `getContent()`.
export const usePage = routeLoader$(async ({ url }) => {
  const isPreviewing = url.searchParams.has("builder.preview");

  // Fetch Builder.io Visual CMS content using the Qwik SDK.
  // The public API key is set in the .env file at the root
  // https://www.builder.io/c/docs/using-your-api-key
  const normalPage = await getContent({
    model: "page",
    apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  const articlePage = await getContent({
    model: "article",
    apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });

  const foundPage = !!normalPage || !!articlePage;

  // If there's no content, throw a 404.
  // You can use your own 404 component here
  if (!foundPage && !isPreviewing) {
    return null;
  }

  // return content fetched from Builder, which is JSON
  return normalPage ?? articlePage;
});

export default component$(() => {
  const page = usePage();

  if (!page.value) {
    return <PageHeadline title="404" subtitle="Page not found" />;
  }

  // RenderContent component uses the `content` prop to render
  // the page, specified by the API Key, at the current URL path.
  return (
    <RenderContent
      model="page"
      content={page.value}
      apiKey={import.meta.env.PUBLIC_BUILDER_API_KEY}
      customComponents={CUSTOM_COMPONENTS}
    />
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const builderContent = resolveValue(usePage);

  if (!builderContent) {
    return {
      title: "404 - Page not found",
    };
  }

  return {
    title: builderContent.data?.title,
  };
};
