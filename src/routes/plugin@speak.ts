import type { RequestHandler } from "@builder.io/qwik-city";
import { setSpeakContext } from "qwik-speak";

import { config } from "../speak";

/**
 * This middleware function must only contain the logic to set the locale,
 * because it is invoked on every request to the server.
 * Avoid redirecting or throwing errors here, and prefer layouts or pages
 */
export const onRequest: RequestHandler = ({ params, locale }) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  let [langPart] = (params.index ?? '').split("/");

  if (langPart.length !== 2) {
    langPart = "";
  }

  let langFromPath = config.defaultLocale.lang;
  if (
    langPart &&
    !config.supportedLocales.find((locale) => locale.lang === langPart)
  ) {
    langFromPath = langPart;
  }

  // Set Speak context (optional: set the configuration on the server)
  setSpeakContext(config);

  // Set Qwik locale
  locale(langFromPath);
};
