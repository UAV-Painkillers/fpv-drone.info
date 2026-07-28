/**
 * Rebuilds libs/content/src/manifest.json from the MDX frontmatter on disk.
 * Run this after editing content (titles, steps, prerequisites):
 *   pnpm tsx tools/scripts/rebuild-content-manifest.mts
 */
import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(import.meta.dirname, '../../libs/content/src');
const LOCALES = ['en', 'de', 'es', 'fr', 'pl'];
const PAGES = ['imprint', 'data-privacy', 'analyzer'];
const GUIDES = ['pid-tuning', 'filter-tuning'];

const manifest: Record<string, unknown> = {};

for (const locale of LOCALES) {
  const pages: Record<string, unknown> = {};
  for (const page of PAGES) {
    const { data } = matter(
      await fs.readFile(path.join(SRC, locale, `${page}.mdx`), 'utf8'),
    );
    pages[page] = data;
  }

  const guides: Record<string, unknown> = {};
  for (const guide of GUIDES) {
    const guideDir = path.join(SRC, locale, 'guides', guide);
    const { data: guideMeta } = matter(
      await fs.readFile(path.join(guideDir, 'index.mdx'), 'utf8'),
    );
    const stepFiles = (await fs.readdir(path.join(guideDir, 'steps'))).sort();
    const steps = [];
    for (const file of stepFiles) {
      const { data } = matter(
        await fs.readFile(path.join(guideDir, 'steps', file), 'utf8'),
      );
      steps.push(data);
    }
    steps.sort((a, b) => (a as { order: number }).order - (b as { order: number }).order);

    // Steps are addressed by slug in the URL, so a duplicate slug makes the
    // later step unreachable and sends the wizard back to the earlier one.
    const slugs = steps.map((s) => (s as { slug: string }).slug);
    const duplicates = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
    if (duplicates.length) {
      throw new Error(
        `Duplicate step slugs in ${locale}/${guide}: ${duplicates.join(', ')}`,
      );
    }

    guides[guide] = { ...guideMeta, stepCount: steps.length, steps };
  }

  manifest[locale] = { pages, guides };
}

await fs.writeFile(
  path.join(SRC, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log('manifest.json rebuilt');
