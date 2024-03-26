import { component$ } from "@builder.io/qwik";
import { Content } from "@builder.io/sdk-qwik";

export default component$(() => {
  return (
    <div>
      <h1>Edit Symbol Page</h1>
      <Content model="symbol" apiKey={import.meta.env.PUBLIC_BUILDER_API_KEY} />
    </div>
  );
});
