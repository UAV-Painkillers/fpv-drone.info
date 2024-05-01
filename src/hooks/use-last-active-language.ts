import { $, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { useSpeakLocale } from "qwik-speak";

const LOCAL_STORAGE_KEY = "lastActiveLanguage";

export function useLastActiveLanguage() {
  const location = useLocation();
  const activeLocale = useSpeakLocale();

  const changeLanguageToLastStored = $(() => {
    const storedLastActiveLanguage = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!storedLastActiveLanguage) {
      return;
    }

    window.location.pathname = `/${storedLastActiveLanguage}`;
  });

  const updateLastActiveLanguage = $(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, activeLocale.lang);
  });

  // change language to the last active language if the user is on the home page
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(location);

    if (location.url.pathname === "/") {
      changeLanguageToLastStored();
      return;
    }

    updateLastActiveLanguage();
  });
}
