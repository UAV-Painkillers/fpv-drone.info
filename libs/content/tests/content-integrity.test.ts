import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import {
  guideManifestSchema,
  guideMetaSchema,
  localeManifestSchema,
  pageMetaSchema,
  stepMetaSchema,
} from '../src/schema';

const SRC = path.resolve(__dirname, '../src');
const LOCALES = ['en', 'de', 'es', 'fr', 'pl'];
const PAGES = ['imprint', 'data-privacy', 'analyzer'];
const GUIDES = ['pid-tuning', 'filter-tuning'];

async function readFm(rel: string) {
  const raw = await fs.readFile(path.join(SRC, rel), 'utf8');
  return matter(raw);
}

describe('content integrity', () => {
  it('manifest parses and covers every locale', async () => {
    const manifest = JSON.parse(
      await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'),
    );
    for (const locale of LOCALES) {
      const m = localeManifestSchema.parse(manifest[locale]);
      expect(Object.keys(m.pages).sort()).toEqual([...PAGES].sort());
      expect(Object.keys(m.guides).sort()).toEqual([...GUIDES].sort());
    }
  });

  it.each(LOCALES)('%s: pages exist with valid frontmatter', async (locale) => {
    for (const page of PAGES) {
      const { data, content } = await readFm(`${locale}/${page}.mdx`);
      pageMetaSchema.parse(data);
      expect(content.trim().length).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES)('%s: guides match manifest and are complete', async (locale) => {
    const manifest = JSON.parse(
      await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'),
    )[locale];
    for (const guide of GUIDES) {
      const guideManifest = guideManifestSchema.parse(manifest.guides[guide]);
      const { data } = await readFm(`${locale}/guides/${guide}/index.mdx`);
      guideMetaSchema.parse(data);

      const stepsDir = path.join(SRC, locale, 'guides', guide, 'steps');
      const files = (await fs.readdir(stepsDir)).sort();
      expect(files).toHaveLength(guideManifest.stepCount);
      expect(files).toHaveLength(guideManifest.steps.length);

      for (const step of guideManifest.steps) {
        const file = `${String(step.order).padStart(2, '0')}-${step.slug}.mdx`;
        expect(files).toContain(file);
        const { data: stepData, content } = await readFm(
          `${locale}/guides/${guide}/steps/${file}`,
        );
        const meta = stepMetaSchema.parse(stepData);
        expect(meta.slug).toBe(step.slug);
        expect(meta.order).toBe(step.order);
        expect(content.trim().length).toBeGreaterThan(0);
      }

      // orders are sequential starting at 1
      expect(guideManifest.steps.map((s) => s.order)).toEqual(
        guideManifest.steps.map((_, i) => i + 1),
      );
    }
  });

  it.each(LOCALES)(
    '%s: step counts match the English reference',
    async (locale) => {
      const manifest = JSON.parse(
        await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'),
      );
      for (const guide of GUIDES) {
        expect(manifest[locale].guides[guide].stepCount).toBe(
          manifest.en.guides[guide].stepCount,
        );
      }
    },
  );

  it('no remote storyblok URLs remain in content', async () => {
    async function walk(dir: string): Promise<string[]> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) files.push(...(await walk(p)));
        else if (e.name.endsWith('.mdx')) files.push(p);
      }
      return files;
    }
    for (const file of await walk(SRC)) {
      const raw = await fs.readFile(file, 'utf8');
      expect(raw, `${file} references a.storyblok.com`).not.toMatch(
        /a\.storyblok\.com/,
      );
    }
  });
});
