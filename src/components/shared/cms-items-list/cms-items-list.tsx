import {
  $,
  Resource,
  component$,
  useContext,
  useOnWindow,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import type { ISbStoryData } from "@storyblok/js";
import { loadStoryblokBridge } from "@storyblok/js";
import { StoryblokContext } from "~/routes/[...index]/storyblok.ctx";
import { getStoryBlokApi } from "~/routes/plugin@storyblok";

interface Props {
  itemsListStorySlug: string;
  render: QRL<(list: ISbStoryData) => JSX.Element>;
}

export const CMSItemsList = component$((props: Props) => {
  const storyblokContext = useContext(StoryblokContext);
  const previewItemsList = useSignal<ISbStoryData>();

  const itemsResource = useResource$<ISbStoryData>(async () => {
    const { data } = await getStoryBlokApi()
      .getStory(props.itemsListStorySlug, {
        version: storyblokContext.versionToLoad,
        language: storyblokContext.language,
        resolve_relations: "items",
      })
      .catch((e) => {
        console.error(
          "Error fetching cms-items-list",
          props.itemsListStorySlug,
          e,
        );
        throw e;
      });

    return data.story;
  });

  useOnWindow(
    "load",
    $(async () => {
      await loadStoryblokBridge();
      const { StoryblokBridge, location } = window;
      const storyblokInstance = new StoryblokBridge();
      storyblokInstance.on(["published", "change"], () => {
        location.reload();
      });
      storyblokInstance.on("input", (event) => {
        previewItemsList.value = event?.story;
      });
    }),
  );

  if (previewItemsList.value) {
    return <>{props.render(previewItemsList.value)}</>;
  }

  return (
    <Resource
      value={itemsResource}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={(itemsList) => <>{props.render(itemsList)}</>}
    />
  );
});
