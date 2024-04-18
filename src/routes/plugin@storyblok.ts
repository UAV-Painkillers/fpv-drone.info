import { storyblokInit, apiPlugin } from "@storyblok/js";

const { storyblokApi } = storyblokInit({
  accessToken: import.meta.env.PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  bridge: true,
  apiOptions: {
    region: "eu",
  },
});

export function getStoryBlokApi() {
  if (!storyblokApi) {
    throw new Error("Not Storyblok plugin found to make the API calls");
  }

  return storyblokApi;
}