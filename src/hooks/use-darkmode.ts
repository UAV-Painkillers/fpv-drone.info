import { useSignal, useVisibleTask$ } from "@builder.io/qwik";

export function useDarkmode() {
  const isDarkmode = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateDarkmode = () => {
      isDarkmode.value = mediaQuery.matches;
    };
    mediaQuery.addEventListener("change", updateDarkmode);
    updateDarkmode();

    cleanup(() => {
      mediaQuery.removeEventListener("change", updateDarkmode);
    });
  });

  return isDarkmode;
}
