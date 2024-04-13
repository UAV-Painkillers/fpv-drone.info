import { component$ } from "@builder.io/qwik";
import { Content } from "@builder.io/sdk-qwik";
import { CUSTOM_COMPONENTS } from "~/components/builder-registry";

export default component$(() => {
  return (
    <div>
      <h1>Edit Symbol Page</h1>
      <Content
        model="symbol"
        customComponents={CUSTOM_COMPONENTS}
        apiKey={import.meta.env.PUBLIC_BUILDER_API_KEY}
      />
    </div>
  );
});
