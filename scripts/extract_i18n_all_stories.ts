import type { ISbStoryData } from "@storyblok/js";
import { storyblokInit, apiPlugin } from "@storyblok/js";
import { promises as fs } from "fs";
import { config } from "dotenv";

config();

const { storyblokApi } = storyblokInit({
  accessToken: process.env.PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
  },
});

async function getAllPageStories(lang: string) {
  const allStories: ISbStoryData[] = [];

  for (;;) {
    const { data, total } = await storyblokApi!.getStories({
      version: "published",
      language: lang,
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

async function extractStoriesForLang(lang: string) {
  const allStories = await getAllPageStories(lang);
  const outFolder = "i18n-stories/" + lang;

  console.log("got stories", allStories.length);

  for (const story of allStories) {
    let fullFilename = story.full_slug.replace(lang + '/', '');

    if (fullFilename.endsWith('/')) {
      fullFilename = fullFilename.substring(0, fullFilename.length - 2);
    }
    fullFilename += ".json";

    const fullpath = `${outFolder}/${fullFilename}`;

    const pathparts = fullpath.split("/");
    const _fileName = pathparts.pop();

    if (pathparts.length > 1) {
      const dir = pathparts.join("/");
      console.log('creating dir', dir);
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(fullpath, JSON.stringify(story, null, 4));
  }
}

async function run() {
  const languages = ['de', 'en', 'pl', 'fr', 'es'];
  
  for (const lang of languages) {
    await extractStoriesForLang(lang);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(-1);
});
