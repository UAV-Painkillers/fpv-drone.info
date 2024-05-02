import { createContextId } from "@builder.io/qwik";

export enum BlockableCaches {
  PID_ANALYZER = "PID_ANALYZER",
}

export interface AppContextState {
  showPageHeader: boolean;
  isPreviewing: boolean;
  unblockedCaches: Array<BlockableCaches>;
  translations: Record<string, string>;
}

export const AppContext = createContextId<AppContextState>("app");
