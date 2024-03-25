import { type RequestHandler } from "@builder.io/qwik-city";
import { fetchOneEntry } from "@builder.io/sdk-qwik";
import { generateOgImage } from "./generate-og-image";

export const onGet: RequestHandler = async (requestEvent) => {
  requestEvent.headers.set("Content-Type", "image/jpeg");
  // should cache for 48 hours
  requestEvent.headers.set("Cache-Control", "public, max-age=172800");

  const writableStream = requestEvent.getWritableStream();

  const TITLE_MAX_LENGTH = 26;
  const SUB_TITLE_MAX_LENGTH = 38;

  let title =
    requestEvent.url.searchParams.get("title") ||
    "fpv-drone.info".substring(0, TITLE_MAX_LENGTH);
  let subTitle =
    requestEvent.url.searchParams.get("subTitle") ||
    "Guides, Tools and Products".substring(0, SUB_TITLE_MAX_LENGTH);
  const builderIoID = requestEvent.url.searchParams.get("builder-io-id");

  if (builderIoID) {
    const page = await fetchOneEntry({
      model: "page",
      apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
      query: {
        id: builderIoID,
      },
      fields: "data.ogTitle,data.ogDescription",
    });

    title = page?.data?.ogTitle || title;
    subTitle = page?.data?.ogDescription || subTitle;
  }

  const svgTemplateFileName = "og_image_template.svg";
  const ogImageBlob = await generateOgImage({
    title,
    subtitle: subTitle,
    originUrl: requestEvent.url,
    svgTemplateFileName,
  });

  ogImageBlob.stream().pipeTo(writableStream);
};
