import type { QRL } from "@builder.io/qwik";
import { Resource, component$, useResource$ } from "@builder.io/qwik";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import type { BuilderContent } from "@builder.io/sdk-qwik";
import { fetchEntries } from "@builder.io/sdk-qwik";

interface Props {
  dataModelName: string;
  item: QRL<(item: BuilderContent) => JSX.Element>;
}

/** generic component that renders given component for each data item */
export const BuilderDataList = component$((props: Props) => {
  const { dataModelName } = props;

  const itemsResource = useResource$<BuilderContent[] | null>(async () => {
    return await fetchEntries({
      model: dataModelName,
      apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
    });
  });

  return (
    <Resource
      value={itemsResource}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={(items) => <>{items?.map((item) => props.item(item))}</>}
    />
  );
});
