import { createContextId } from "@builder.io/qwik";

export interface AppContextState {
  showPageHeader: boolean;
  isPreviewing: boolean;
}

export const AppContext = createContextId<AppContextState>("app");
