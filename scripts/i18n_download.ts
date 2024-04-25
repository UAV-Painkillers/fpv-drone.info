// download translations from storyblok cms datasources
// and save them as json files in the i18n/[lang] folder

import { storyblokInit, apiPlugin } from "@storyblok/js";
import { set } from "lodash-es";
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

async function fetchTranslations(lang: string, asset: string) {
  const allDataSourceEntries = [];
  let nextPage = 1;
  for (;;) {
    const cacheBuster = Date.now();
    const { data, total } = await storyblokApi!.get(`cdn/datasource_entries?buster=${cacheBuster}`, {
      datasource: `translations-${asset}`,
      dimension: lang,
      page: nextPage,
      per_page: 100,
      version: "published",
    });

    allDataSourceEntries.push(...data.datasource_entries);

    if (total <= allDataSourceEntries.length) {
      break;
    }

    nextPage++;
  }

  const translations: Record<string, string> = {};
  allDataSourceEntries.forEach(
    (entry: { name: string; dimension_value?: string; value?: string }) => {
      set(translations, entry.name, entry.dimension_value ?? entry.value);
    }
  );

  return translations;
}

const langs = ["en", "de"];
const assets = ["main"];

console.log("Downloading translations...");
console.log("Languages:", langs);
console.log("Assets:", assets);

const downloadedTranslations = new Map<string, Record<string, string>>();

for (const lang of langs) {
  for (const asset of assets) {
    console.log(`Downloading translations for ${lang}/${asset}`);
    const translations = await fetchTranslations(lang, asset);

    downloadedTranslations.set(`${lang}/${asset}`, translations);
  }
}

console.log("All translations downloaded");

console.log("Replacing current translation json files...");

// delete all current translation json files by unlinking and recreating the i18n folder
if (await fs.stat("i18n").catch(() => null)) {
  await fs.rm("i18n", { recursive: true });
}

for (const [langAsset, translations] of downloadedTranslations) {
  const [lang, asset] = langAsset.split("/");
  await fs.mkdir(`i18n/${lang}`, { recursive: true });
  await fs.writeFile(
    `i18n/${lang}/${asset}.json`,
    JSON.stringify(translations, null, 2)
  );
  console.log(`Saved ${lang}/${asset}.json`);
}

console.log("All translations saved");