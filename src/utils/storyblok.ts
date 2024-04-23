import type { ISbStoryData } from "storyblok-js-client";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";

export async function getAllPageStories() {
  const allStories: ISbStoryData[] = [];

  for (;;) {
    const { data, total } = await getStoryBlokApi().getStories({
      version: "published",
      language: "en",
      content_type: "page",
      resolve_relations: [
        "*",
        "cms-snippet.reference",
        "instruction-step-item.sourceStep",
      ],
      per_page: 100,
    });

    allStories.push(...data.stories);

    if (allStories.length >= total) {
      break;
    }
  }

  return allStories;
}
