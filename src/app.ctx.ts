import { createContextId } from "@builder.io/qwik";

export interface AppContextState {
  showPageHeader: boolean;
}

export const AppContext = createContextId<AppContextState>("app");
