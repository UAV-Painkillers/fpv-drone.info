import type { Locale } from '@fpv/i18n';
import type { MDXContent } from 'mdx/types';
import rawManifest from './manifest.json';
import {
  localeManifestSchema,
  pageMetaSchema,
  stepMetaSchema,
  type GuideManifest,
  type LocaleManifest,
  type PageMeta,
  type StepMeta,
} from './schema';

export type PageName = 'imprint' | 'data-privacy' | 'analyzer';
export type GuideSlug = 'pid-tuning' | 'filter-tuning';

interface MdxModule {
  default: MDXContent;
  frontmatter?: unknown;
}

// Top-level pages are few and small — eager keeps rendering synchronous.
// Guide step bodies (110 files) stay lazy; navigation metadata comes from
// manifest.json instead.
const pageModules = import.meta.glob<MdxModule>('./*/*.mdx', { eager: true });
const stepModules = import.meta.glob<MdxModule>('./*/guides/*/steps/*.mdx');

const MANIFEST: Record<string, LocaleManifest> = Object.fromEntries(
  Object.entries(rawManifest).map(([locale, m]) => [
    locale,
    localeManifestSchema.parse(m),
  ]),
);

export function getManifest(locale: Locale): LocaleManifest {
  const m = MANIFEST[locale];
  if (!m) throw new Error(`No content manifest for locale "${locale}"`);
  return m;
}

export function getGuideManifest(locale: Locale, slug: string): GuideManifest | null {
  return getManifest(locale).guides[slug] ?? null;
}

export function getPage(
  locale: Locale,
  name: PageName,
): { Content: MDXContent; meta: PageMeta } {
  const mod = pageModules[`./${locale}/${name}.mdx`];
  if (!mod) throw new Error(`Missing content: ${locale}/${name}.mdx`);
  return { Content: mod.default, meta: pageMetaSchema.parse(mod.frontmatter) };
}

export async function loadGuideStep(
  locale: Locale,
  guide: string,
  stepSlug: string,
): Promise<{ Content: MDXContent; meta: StepMeta } | null> {
  const manifest = getGuideManifest(locale, guide);
  const step = manifest?.steps.find((s) => s.slug === stepSlug);
  if (!step) return null;
  const key = `./${locale}/guides/${guide}/steps/${String(step.order).padStart(2, '0')}-${step.slug}.mdx`;
  const loader = stepModules[key];
  if (!loader) throw new Error(`Missing content module: ${key}`);
  const mod = await loader();
  return { Content: mod.default, meta: stepMetaSchema.parse(mod.frontmatter) };
}

/** All module keys, for integrity tests. */
export function contentModuleKeys() {
  return {
    pages: Object.keys(pageModules),
    steps: Object.keys(stepModules),
  };
}
