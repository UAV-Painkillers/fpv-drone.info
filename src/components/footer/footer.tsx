import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import styles from "./footer.module.css";
import classNames from "classnames";
import { DynamicLinkList } from "../shared/dynamic-link-list/dynamic-link-list";
import { inlineTranslate, useSpeakConfig, useSpeakLocale } from "qwik-speak";
import { changeLanguageInURLPathname } from "~/utils/i18n";
import { useLocation } from "@builder.io/qwik-city";
import LanguagesFroggoImage from "../../assets/languages_froggo_cropped.png?jsx";

export const Footer = component$<IntrinsicElements["footer"]>((props) => {
  const speakConfig = useSpeakConfig();
  const activeLocale = useSpeakLocale();
  const t = inlineTranslate();
  const location = useLocation();

  const ownerLine = t("footer.owner", {
    link: `<a href="https://uav-painkillers.de" target="_blank" class="anchor">
        UAV-Painkillers
      </a>`,
  });

  const languages = useComputed$(() => {
    return speakConfig.supportedLocales.map((locale) => ({
      lang: locale.lang,
      url: changeLanguageInURLPathname(
        location.url.pathname,
        activeLocale.lang,
        locale.lang,
      ),
      active: locale.lang === activeLocale.lang,
    }));
  });

  return (
    <footer {...props} class={classNames(styles.container, props.class)}>
      <div>
        <div style={{ display: "inline-block" }}>
          <DynamicLinkList
            class="aligned-list"
            navigationStorySlug="navigations/navigation-footer"
          />
        </div>
      </div>
      <br />

      <LanguagesFroggoImage style={{ width: 100, height: "auto" }} />

      <div>
        <div style={{ display: "inline-block" }}>
          <ul class="aligned-list">
            {languages.value.map((language) => (
              <li key={language.lang} style={{ flexBasis: "100%" }}>
                <a
                  href={language.url}
                  class={classNames("anchor", {
                    active: language.active,
                  })}
                >
                  {t(`language.${language.lang}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <br />

      <p>
        <span dangerouslySetInnerHTML={ownerLine}></span>
        <br />
        <br />
        <small>&copy; 2024 Jaap und Piskun GbR - UAV Painkillers</small>
      </p>
    </footer>
  );
});
