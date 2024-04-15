import { createContextId } from "@builder.io/qwik";
import type { NoSerialize } from "@builder.io/qwik";

export interface AppContextState {
  showPageHeader: boolean;
  isPreviewing: boolean;
  serviceWorker: NoSerialize<ServiceWorker | undefined>;
}

export const AppContext = createContextId<AppContextState>("app");
