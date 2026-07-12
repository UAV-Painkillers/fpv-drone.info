import { DEFAULT_LOCALE, isLocale, LOCALES, MESSAGES, type Locale } from '@fpv/i18n';

export const SITE_ORIGIN = 'https://fpv-drone.info';

interface SeoOptions {
  locale: string;
  /** Route path without the locale prefix, e.g. "/tools/blackbox-analyzer". */
  path: string;
  title: string;
  description?: string;
  /** OG image path; defaults to the per-locale-page image when generated. */
  image?: string;
}

/**
 * Builds the TanStack `head()` result for a localized route: title,
 * description, canonical, hreflang alternates (all 5 locales + x-default)
 * and OpenGraph/Twitter tags — everything baked into the static HTML.
 */
export function buildSeo({ locale, path, title, description, image }: SeoOptions) {
  const resolvedLocale: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const siteName = MESSAGES[resolvedLocale].meta.siteName;
  const fullTitle = title === siteName ? title : `${title} · ${siteName}`;
  const canonical = `${SITE_ORIGIN}/${resolvedLocale}${path}`;
  const ogImage = `${SITE_ORIGIN}${image ?? `/og/${resolvedLocale}${path === '' ? '/home' : path}.png`}`;

  return {
    meta: [
      { title: fullTitle },
      ...(description ? [{ name: 'description', content: description }] : []),
      { property: 'og:title', content: fullTitle },
      ...(description
        ? [{ property: 'og:description', content: description }]
        : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: ogImage },
      { property: 'og:site_name', content: siteName },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'canonical', href: canonical },
      ...LOCALES.map((l) => ({
        rel: 'alternate',
        hrefLang: l,
        href: `${SITE_ORIGIN}/${l}${path}`,
      })),
      {
        rel: 'alternate',
        hrefLang: 'x-default',
        href: `${SITE_ORIGIN}/${DEFAULT_LOCALE}${path}`,
      },
    ],
  };
}
