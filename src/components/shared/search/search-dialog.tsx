import type { QRL } from "@builder.io/qwik";
import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { Dialog } from "../dialog/dialog";
import type { BuilderContent } from "@builder.io/sdk-qwik";
import type { CardGridProps } from "../card/card-grid";
import { CardGrid } from "../card/card-grid";
import styles from "./search-dialog.module.css";

type StoredAlgoliaResult = Omit<BuilderContent, "data"> & {
  data?: Partial<{
    title: string;
    description: string;
    previewImage: string;
  }>;
  uri: string;
};

type AlgoliaResult = {
  hits: (BuilderContent & {
    query: Array<{ property: string; operator: string; value: string }>;
  })[];
};

interface DialogContentProps {
  onCardClicked$?: QRL<() => any>;
}
const DialogContent = component$((props: DialogContentProps) => {
  const termSignal = useSignal("");
  const hitsSig = useSignal<StoredAlgoliaResult[]>([]);
  const searchInputTimeout = useSignal<number | null>(null);

  const onSearch = $(async (query: string) => {
    const algoliaURL = new URL(
      `/1/indexes/${import.meta.env.VITE_ALGOLIA_INDEX}/query`,
      `https://${import.meta.env.VITE_ALGOLIA_APP_ID}-dsn.algolia.net`,
    );
    const response = await fetch(algoliaURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Algolia-Application-Id": import.meta.env.VITE_ALGOLIA_APP_ID!,
        "X-Algolia-API-Key": import.meta.env.VITE_ALGOLIA_SEARCH_KEY!,
      },
      body: JSON.stringify({ query }),
    });
    const algoliaResult: AlgoliaResult = await response.json();
    hitsSig.value = algoliaResult.hits
      .map(
        (h) =>
          ({
            ...h,
            data: {
              ...h.data,
              blocks: undefined,
            },
            uri:
              h.query.find(
                (q) => q.property === "urlPath" && q.operator === "is",
              )?.value || "",
          }) as StoredAlgoliaResult,
      )
      .filter((h) => h.published);
    console.log(algoliaResult);
  });

  const onSearchInput = $((e: Event) => {
    const input = e.target as HTMLInputElement;
    termSignal.value = input.value;
    if (searchInputTimeout.value) {
      clearTimeout(searchInputTimeout.value);
    }
    searchInputTimeout.value = setTimeout(() => {
      onSearch(termSignal.value);
    }, 500) as unknown as number;
  });

  const resultRows = useComputed$(() => {
    const rows: CardGridProps["rows"] = [];
    hitsSig.value.forEach((page, index) => {
      if (index % 3 === 0) {
        rows.push([]);
      }
      rows[rows.length - 1].push({
        title: page.data?.title ?? "",
        headerImageSrc: page.data?.previewImage,
        description: page.data?.description,
        href: page.uri,
        onClick$: props.onCardClicked$,
      });
    });
    return rows;
  });

  return (
    <div class={styles.wrapper}>
      <input
        class={styles.search}
        type="search"
        placeholder="What are you looking for?"
        onInput$={(e) => {
          onSearchInput(e);
        }}
      />

      <div class={styles.results}>
        <CardGrid rows={resultRows.value} />
      </div>
    </div>
  );
});

interface DialogProps {
  isOpen: boolean;
  onClose: QRL<() => any>;
}
export const SearchDialog = component$((props: DialogProps) => {
  return (
    <Dialog isOpen={props.isOpen} onClose={props.onClose}>
      <DialogContent onCardClicked$={props.onClose} />
    </Dialog>
  );
});
