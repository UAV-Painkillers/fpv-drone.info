import { $, createContextId, useContext } from "@builder.io/qwik";
import type { JSX } from "@builder.io/qwik/jsx-runtime";

export interface TranslationsContextState {
  activeLanguage: string;
  translations: Record<string, string>;
}

export const TranslationsContext =
  createContextId<TranslationsContextState>("translations");

export const useTranslationFunction = (
  translations: Record<string, string>
) => {
  return (key: string, replacements?: Record<string, JSX.Element>): string | JSX.Element => {
    const translation = translations[key] ?? key;
    if (!replacements) {
      return translation;
    }

    // we need to return a valid JSX.Element here, so we need to split the translation
    // into parts and insert the replacements in between

    const parts = translation.split(/(\{.*?\})/);
    let hadJSXReplacement = false;

    const translatedParts = parts.map((part) => {
      if (part.startsWith("{") && part.endsWith("}")) {
        const key = part.slice(1, -1);

        // if the replacement is a JSX element, we need set hadJSXReplacement to true
        // so that we can return a JSX.Element instead of a string
        if (typeof replacements[key] !== "string") {
          hadJSXReplacement = true;
        }

        return replacements[key] ?? `{${key}}`;
      }
      return part;
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!hadJSXReplacement) {
      return translatedParts.join("");
    }

    return <>{translatedParts}</>;
  };
};

export const useTranslation = (
  key: string,
  replacements?: Record<string, JSX.Element>
) => {
  const translationsContext = useContext(TranslationsContext);
  const translate = useTranslationFunction(translationsContext.translations);
  return translate(key, replacements);
};
