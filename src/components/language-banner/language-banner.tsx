import {
  $,
  component$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Banner } from "../banner/banner";
import { inlineTranslate, useSpeakConfig, useSpeakLocale } from "qwik-speak";
import { useLocation } from "@builder.io/qwik-city";
import { changeLanguageInURLPathname } from "~/utils/i18n";
import classNames from "classnames";

export const LanguageBanner = component$(() => {
  const location = useLocation();
  const activeLocale = useSpeakLocale();
  const speakConfig = useSpeakConfig();

  const browserLanguage = useSignal<string | undefined>(undefined);

  const t = inlineTranslate();

  const updateBrowserLanguage$ = $(() => {
    const navigatorLanguageCode = navigator.language;

    const [localePart] = navigatorLanguageCode.split("-");
    browserLanguage.value = localePart.toLowerCase();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    updateBrowserLanguage$();

    window.addEventListener("languagechange", updateBrowserLanguage$);
    cleanup(() => {
      window.removeEventListener("languagechange", updateBrowserLanguage$);
    });
  });

  const isBannerVisible = useComputed$(() => {
    if (
      !speakConfig.supportedLocales.find(
        (locale) => locale.lang === browserLanguage.value,
      )
    ) {
      return false;
    }

    return browserLanguage.value !== activeLocale.lang;
  });

  const buttonLabel = t("languageBanner.button.label");

  const languages = useComputed$(() => {
    const t2 = inlineTranslate();
    return speakConfig.supportedLocales.map((locale) => ({
      lang: locale.lang,
      name: t2(`language.${locale.lang}`),
    }));
  });

  const bannerText = useComputed$(() => {
    const t2 = inlineTranslate();
    return t2("languageBanner.text", {
      language: languages.value.find((l) => l.lang === browserLanguage.value)
        ?.name,
    });
  });

  const targetLangHref = useComputed$(() => {
    const href = changeLanguageInURLPathname(
      location.url.pathname,
      activeLocale.lang,
      browserLanguage.value!,
    );

    return href;
  });

  return (
    <div>
      <Banner show={isBannerVisible} variant="warning">
        <span>{bannerText}</span>
        <a class={classNames("button")} href={targetLangHref.value}>
          {buttonLabel}
        </a>
      </Banner>
    </div>
  );
});
