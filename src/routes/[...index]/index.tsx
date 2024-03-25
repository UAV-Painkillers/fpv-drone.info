import { component$ } from "@builder.io/qwik";
import type { DocumentHead, DocumentLink } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  fetchOneEntry,
  Content,
  getBuilderSearchParams,
} from "@builder.io/sdk-qwik";
import { CUSTOM_COMPONENTS } from "../../components/builder-registry";
import { PageHeadline } from "~/components/shared/page-headline/page-headline";

function fetchPageOfModel(model: string, url: URL) {
  return fetchOneEntry({
    model,
    apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: {
      urlPath: url.pathname,
    },
  });
}

export const usePage = routeLoader$(async ({ url }) => {
  const isPreviewing = url.searchParams.has("builder.preview");
  const page = await fetchPageOfModel("page", url);

  if (!page && !isPreviewing) {
    return null;
  }

  return page;
});

export const useRouteURL = routeLoader$(async ({ url }) => {
  return url;
});

export default component$(() => {
  const page = usePage();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!page.value) {
    return <PageHeadline title="404" subtitle="Page not found" />;
  }

  return (
    <>
      <PageHeadline
        title={page.value.data?.content?.title ?? ""}
        subtitle={page.value.data?.content?.description}
      />
      <Content
        model="page"
        content={page.value}
        apiKey={import.meta.env.PUBLIC_BUILDER_API_KEY}
        customComponents={CUSTOM_COMPONENTS}
      />
    </>
  );
});

export const head: DocumentHead = ({ resolveValue,  }) => {
  const builderContent = resolveValue(usePage);
  const location = resolveValue(useRouteURL);

  if (!builderContent) {
    return {
      title: "404 - Page not found",
    };
  }

  const links: DocumentLink[] = [];

  if (builderContent.data?.pwaAlternativeManifestName) {
    links.push({
      rel: "manifest",
      href: `/manifests/${builderContent.data.pwaAlternativeManifestName}.manifest.json`,
    });
  }

  const meta = [
    {
      property: "og:image",
      content: `${location.origin}/api/open-graph?builder-io-id=${builderContent.id}`,
    },
    {
      property: "og:title",
      content: builderContent.data?.ogTitle,
    },
    {
      property: "og:description",
      content: builderContent.data?.ogDescription,
    },
    {
      property: "og:url",
      content: location.href,
    },
  ];

  return {
    title: builderContent.data?.title,
    links,
    meta,
  };
};
