import { useContext, useOnWindow, useVisibleTask$, $ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { AppContext } from "~/app.ctx";

export function useHideHeader() {
  const appContext = useContext(AppContext);
  const location = useLocation();

  const updatePageHeaderVisibility = $(() => {
    let displayMode = "browser";
    const mqStandAlone = "(display-mode: standalone)";
    if (
      (navigator as any).standalone ||
      window.matchMedia(mqStandAlone).matches
    ) {
      displayMode = "standalone";
    }

    appContext.showPageHeader = displayMode !== "standalone";
  });

  useOnWindow("load", updatePageHeaderVisibility);
  useOnWindow("resize", updatePageHeaderVisibility);

  /**
   * Update page header visibility on location change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(location);

    updatePageHeaderVisibility();
  });
}
