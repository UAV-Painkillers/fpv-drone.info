import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { type RequestHandler } from "@builder.io/qwik-city";
import { generateOgImage } from "./generate-og-image";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";
import { getAllPageStories } from "~/utils/storyblok";
import { config as speakConfig } from "~/speak";

export const onGet: RequestHandler = async (requestEvent) => {
  requestEvent.headers.set("Content-Type", "image/jpeg");
  // should cache for 48 hours
  requestEvent.headers.set("Cache-Control", "public, max-age=172800");

  const writableStream = requestEvent.getWritableStream();

  const TITLE_MAX_LENGTH = 26;
  const SUB_TITLE_MAX_LENGTH = 38;

  const DEFAULT_TITLE = "fpv-drone.info";
  const DEFAULT_SUB_TITLE = "Guides, Tools and Products";

  let title = DEFAULT_TITLE;
  let subTitle = DEFAULT_SUB_TITLE;

  const builderIoID = requestEvent.params.storyId;
  const language = requestEvent.params.lang;

  if (builderIoID) {
    const { data } = await getStoryBlokApi().getStory(builderIoID, {
      version: "published",
      language,
    });

    const page = data.story;

    title = page.content.ogTitle || title;
    subTitle = page.content.ogDescription || subTitle;
  }

  title = title.substring(0, TITLE_MAX_LENGTH);
  subTitle = subTitle.substring(0, SUB_TITLE_MAX_LENGTH);

  const endpoint = requestEvent.env.get("OG_IMAGE_GENERATOR_ENDPOINT");
  if (!endpoint) {
    throw new Error("OG_IMAGE_GENERATOR_ENDPOINT env is not set");
  }

  const username = requestEvent.env.get("OG_IMAGE_GENERATOR_USER");
  if (!username) {
    throw new Error("OG_IMAGE_GENERATOR_USER env is not set");
  }

  const password = requestEvent.env.get("OG_IMAGE_GENERATOR_PASSWORD");
  if (!password) {
    throw new Error("OG_IMAGE_GENERATOR_PASSWORD env is not set");
  }

  const svgTemplateFileName = "og_image_template.svg";
  const ogImageBlob = await generateOgImage(
    {
      title,
      subtitle: subTitle,
      originUrl: requestEvent.url,
      svgTemplateFileName,
    },
    {
      endpoint,
      username,
      password,
    },
  ).catch((error) => {
    console.error("Failed to generate OG image", error);
    return null;
  });

  if (!ogImageBlob) {
    requestEvent.error(500, "Failed to generate OG image");
    return;
  }

  ogImageBlob.stream().pipeTo(writableStream);
};

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const allStories = await getAllPageStories();

  const params: Array<Record<string, string>> = [];

  speakConfig.supportedLocales.forEach((locale) => {
    allStories.forEach((story) => {
      params.push({
        lang: locale.lang,
        storyId: story.id.toString(),
      });
    });
  });

  return {
    params,
  };
};
