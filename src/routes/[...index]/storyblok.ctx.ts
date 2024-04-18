import { createContextId } from "@builder.io/qwik";

export interface StoryblokContextState {
  versionToLoad: "published" | "draft";
  language: string;
}

export const StoryblokContext =
  createContextId<StoryblokContextState>("storyblok");
