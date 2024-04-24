import { useComputed$ } from "@builder.io/qwik";

interface StoryblokHref {
  url?: string;
  cached_url?: string;
}

export const transformStoryblokHref = (
  href?: StoryblokHref,
): string | undefined => {
  if (!href) {
    return undefined;
  }

  const urlFromHref: string = href.url || href.cached_url!;

  if (urlFromHref.trim() === "") {
    return undefined;
  }

  if (
    urlFromHref.startsWith("#") ||
    urlFromHref.startsWith("http://") ||
    urlFromHref.startsWith("https://") ||
    urlFromHref.startsWith("mailto:") ||
    urlFromHref.startsWith("tel:")
  ) {
    return urlFromHref;
  }

  if (urlFromHref.startsWith("/")) {
    return urlFromHref;
  }

  return `/${urlFromHref}`;
};

export const useStoryblokURL = (href: StoryblokHref) => {
  const actualUrl = useComputed$(() => {
    return transformStoryblokHref(href);
  });

  return actualUrl;
};
