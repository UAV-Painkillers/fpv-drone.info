import { server$ } from "@builder.io/qwik-city";
import { set } from "lodash-es";
import type { LoadTranslationFn, TranslationFn } from "qwik-speak";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";

async function fetchTranslations(lang: string, asset: string) {
  const allDataSourceEntries = [];
  let nextPage = 1;
  for (;;) {
    const { data, total } = await getStoryBlokApi().get(
      "cdn/datasource_entries",
      {
        datasource: `translations-${asset}`,
        dimension: lang,
        page: nextPage,
        per_page: 100,
      },
    );

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
    },
  );

  return translations;
}

const loadTranslation$: LoadTranslationFn = server$(
  async (lang: string, asset: string) => {
    return await fetchTranslations(lang, asset);
  },
);

export const translationFn: TranslationFn = {
  loadTranslation$,
};
