import type { SpeakConfig } from "qwik-speak";

const ENGLISH_LOCALE = {
  lang: "en",
  currency: "USD",
  timeZone: "America/Los_Angeles",
};

export const config: SpeakConfig = {
  defaultLocale: ENGLISH_LOCALE,
  supportedLocales: [
    ENGLISH_LOCALE,
    { lang: "de", currency: "EUR", timeZone: "Europe/Berlin" },
  ],
  assets: ["main"],
};
