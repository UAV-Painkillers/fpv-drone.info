import type { Locale } from '@fpv/i18n';
import type { MDXContent } from 'mdx/types';
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import rawManifest from './manifest.json';
import {
  localeManifestSchema,
  pageMetaSchema,
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

export function getGuideStepMeta(
  locale: Locale,
  guide: string,
  stepSlug: string,
): StepMeta | null {
  const manifest = getGuideManifest(locale, guide);
  return manifest?.steps.find((s) => s.slug === stepSlug) ?? null;
}

const lazyStepCache = new Map<string, LazyExoticComponent<ComponentType>>();

/**
 * Step bodies are code-split per MDX file. React.lazy + Suspense keeps them
 * prerender- and hydration-safe while only the visited step's chunk loads.
 */
export function getGuideStepComponent(
  locale: Locale,
  guide: string,
  stepSlug: string,
): LazyExoticComponent<ComponentType> | null {
  const step = getGuideStepMeta(locale, guide, stepSlug);
  if (!step) return null;
  const key = `./${locale}/guides/${guide}/steps/${String(step.order).padStart(2, '0')}-${step.slug}.mdx`;
  const loader = stepModules[key];
  if (!loader) throw new Error(`Missing content module: ${key}`);
  let cached = lazyStepCache.get(key);
  if (!cached) {
    cached = lazy(async () => ({ default: (await loader()).default }));
    lazyStepCache.set(key, cached);
  }
  return cached;
}

/** All module keys, for integrity tests. */
export function contentModuleKeys() {
  return {
    pages: Object.keys(pageModules),
    steps: Object.keys(stepModules),
  };
}
