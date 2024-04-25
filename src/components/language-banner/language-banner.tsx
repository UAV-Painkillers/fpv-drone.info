import {
  $,
  component$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Banner } from "../shared/banner/banner";
import { inlineTranslate, useSpeakConfig, useSpeakLocale } from "qwik-speak";
import { useLocation } from "@builder.io/qwik-city";
import { changeLanguageInURLPathname } from "~/utils/i18n";

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
        (locale) => locale.lang === browserLanguage.value
      )
    ) {
      return false;
    }

    return browserLanguage.value !== activeLocale.lang;
  });

  const buttonLabel = t("languageBanner.button.label");

  const targetLanguage = useComputed$(() => {
    const t2 = inlineTranslate();
    return t2(`language.${browserLanguage.value}`);
  });

  const bannerText = useComputed$(() => {
    const t2 = inlineTranslate();
    return t2("languageBanner.text", { language: targetLanguage.value })
});

  const targetLangHref = useComputed$(() => {
    return changeLanguageInURLPathname(
      location.url.pathname,
      activeLocale.lang,
      browserLanguage.value!
    );
  });

  return (
    <div>
      <Banner show={isBannerVisible}>
        <span>{bannerText}</span>
        <a class="button" href={targetLangHref.value}>
          {buttonLabel}
        </a>
      </Banner>
    </div>
  );
});
