import { createContextId } from "@builder.io/qwik";

export interface StoryblokContextState {
  versionToLoad: "published" | "draft";
}

export const StoryblokContext =
  createContextId<StoryblokContextState>("storyblok");
