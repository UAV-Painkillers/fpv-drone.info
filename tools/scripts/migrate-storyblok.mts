/**
 * One-time migration: Storyblok story snapshots (i18n-stories/) → MDX content
 * (libs/content/src/{locale}/) + local guide images (apps/web/public/guide-images/).
 *
 * The snapshots embed all resolved references (cms-snippet, sourceStep), so no
 * CMS access is needed. Remote a.storyblok.com images are downloaded once and
 * converted to WebP.
 *
 * Run: pnpm tsx tools/scripts/migrate-storyblok.mts
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');
const STORIES = path.join(ROOT, 'i18n-stories');
const CONTENT_OUT = path.join(ROOT, 'libs/content/src');
const IMAGES_OUT = path.join(ROOT, 'apps/web/public/guide-images');
const LOCALES = ['en', 'de', 'es', 'fr', 'pl'] as const;

/* ------------------------------- utilities ------------------------------- */

type Json = Record<string, any>;

const imageMap = new Map<string, string>(); // remote url -> /guide-images/x.webp

async function downloadImage(url: string): Promise<string> {
  const cached = imageMap.get(url);
  if (cached) return cached;
  const base = path.basename(new URL(url).pathname, path.extname(url));
  let name = `${base}.webp`;
  // guard against different assets sharing a basename
  if ([...imageMap.values()].includes(`/guide-images/${name}`)) {
    name = `${new URL(url).pathname.split('/')[4]}-${base}.webp`;
  }
  const target = path.join(IMAGES_OUT, name);
  const publicPath = `/guide-images/${name}`;
  try {
    await fs.access(target);
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const img = sharp(buf);
    const meta = await img.metadata();
    const resized =
      meta.width && meta.width > 1400 ? img.resize({ width: 1400 }) : img;
    await resized.webp({ quality: 82, effort: 6 }).toFile(target);
    console.log(`  image ${name} (${Math.round(buf.length / 1024)}kB → ${Math.round((await fs.stat(target)).size / 1024)}kB)`);
  }
  imageMap.set(url, publicPath);
  return publicPath;
}

function escapeMdxText(text: string): string {
  // Escape characters MDX would interpret. Keep it minimal — guide prose only.
  return text.replace(/\\/g, '\\\\').replace(/([<>{}*_`[\]])/g, '\\$1');
}

function escapeAttr(text: string): string {
  return text.replace(/"/g, '&quot;');
}

function yamlString(s: string): string {
  return JSON.stringify(s); // JSON strings are valid YAML scalars
}

/* --------------------------- richtext → markdown -------------------------- */

function renderMarks(text: string, marks: Json[] | undefined): string {
  let out = escapeMdxText(text);
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case 'bold':
        out = `**${out}**`;
        break;
      case 'italic':
        out = `*${out}*`;
        break;
      case 'code':
        out = `\`${text}\``;
        break;
      case 'link': {
        const href: string = mark.attrs?.href ?? '';
        out = `[${out}](${href})`;
        break;
      }
      // textStyle / highlight: presentational, dropped intentionally
    }
  }
  return out;
}

async function renderInline(nodes: Json[] | undefined): Promise<string> {
  const parts: string[] = [];
  for (const node of nodes ?? []) {
    switch (node.type) {
      case 'text':
        parts.push(renderMarks(node.text ?? '', node.marks));
        break;
      case 'hard_break':
        parts.push('  \n');
        break;
      case 'image': {
        const src = await downloadImage(node.attrs.src);
        parts.push(`![${node.attrs.alt ?? ''}](${src})`);
        break;
      }
      default:
        console.warn('  ! unknown inline node', node.type);
    }
  }
  return parts.join('');
}

async function renderBlockNodes(nodes: Json[] | undefined, indent = ''): Promise<string> {
  const blocks: string[] = [];
  for (const node of nodes ?? []) {
    switch (node.type) {
      case 'paragraph': {
        const text = await renderInline(node.content);
        if (text.trim()) blocks.push(indent + text);
        break;
      }
      case 'heading': {
        const level: number = node.attrs?.level ?? 2;
        // page h1 comes from frontmatter; demote in-content headings to h2+
        const hashes = '#'.repeat(Math.max(2, Math.min(6, level)));
        blocks.push(`${hashes} ${await renderInline(node.content)}`);
        break;
      }
      case 'ordered_list': {
        const items: string[] = [];
        let i = Number(node.attrs?.order ?? 1);
        for (const li of node.content ?? []) {
          items.push(`${indent}${i}. ${(await renderBlockNodes(li.content, '')).replace(/\n+/g, `\n${indent}   `)}`);
          i++;
        }
        blocks.push(items.join('\n'));
        break;
      }
      case 'bullet_list': {
        const items: string[] = [];
        for (const li of node.content ?? []) {
          items.push(`${indent}- ${(await renderBlockNodes(li.content, '')).replace(/\n+/g, `\n${indent}  `)}`);
        }
        blocks.push(items.join('\n'));
        break;
      }
      case 'blockquote':
        blocks.push(
          (await renderBlockNodes(node.content))
            .split('\n')
            .map((l) => `> ${l}`)
            .join('\n'),
        );
        break;
      case 'horizontal_rule':
        blocks.push('---');
        break;
      case 'code_block':
        blocks.push('```\n' + (node.content?.[0]?.text ?? '') + '\n```');
        break;
      default:
        console.warn('  ! unknown block node', node.type);
    }
  }
  return blocks.join('\n\n');
}

async function richtextToMdx(doc: Json | null | undefined): Promise<string> {
  if (!doc || doc.type !== 'doc') return '';
  return renderBlockNodes(doc.content);
}

/* ----------------------------- blok → MDX body ---------------------------- */

function analyzerPropsFromBlok(blok: Json): string {
  const props: string[] = [];
  const activePlots: string[] = blok.activePlots ?? [];
  props.push(`activePlots={${JSON.stringify(activePlots)}}`);
  const navigation: string[] = blok.navigation ?? [];
  if (navigation.length) props.push(`navigation={${JSON.stringify(navigation)}}`);
  if (blok.labelStrengthTemplate && blok.labelStrengthHeaderField) {
    props.push(
      `plotLabels={${JSON.stringify({
        strength: {
          template: blok.labelStrengthTemplate,
          headerField: blok.labelStrengthHeaderField,
        },
      })}}`,
    );
  }
  return props.join(' ');
}

async function bloksToMdx(bloks: Json[] | undefined): Promise<string> {
  const parts: string[] = [];
  for (const blok of bloks ?? []) {
    const out = await blokToMdx(blok);
    if (out.trim()) parts.push(out.trim());
  }
  return parts.join('\n\n');
}

async function blokToMdx(blok: Json): Promise<string> {
  switch (blok.component) {
    case 'text':
      return richtextToMdx(blok.text);
    case 'highlight-card': {
      const body = await richtextToMdx(blok.content);
      const title = blok.title ? ` title="${escapeAttr(blok.title)}"` : '';
      return `<Callout tone="tldr"${title}>\n\n${body}\n\n</Callout>`;
    }
    case 'blackbox-analyzer':
      return `<BlackboxAnalyzer ${analyzerPropsFromBlok(blok)} />`;
    case 'dynamic-idle-calculator':
      return `<DynamicIdleCalculator />`;
    case 'expandable-image': {
      const src = blok.image?.filename
        ? await downloadImage(blok.image.filename)
        : '';
      return src ? `<ExpandableImage src="${src}" alt="${escapeAttr(blok.image?.alt ?? '')}" />` : '';
    }
    case 'sponsors-list': {
      const items = [];
      for (const s of blok.items ?? []) {
        items.push({
          href: s.href?.url || s.href?.cached_url || '',
          logo: s.logo?.filename ? await downloadImage(s.logo.filename) : '',
          name: s.name ?? '',
        });
      }
      return `<Sponsors items={${JSON.stringify(items)}} />`;
    }
    case 'cms-snippet': {
      const parts: string[] = [];
      for (const ref of blok.reference ?? []) {
        if (!ref?.content?.items) continue;
        const out = await bloksToMdx(ref.content.items);
        if (out.trim()) parts.push(out.trim());
      }
      return parts.join('\n\n');
    }
    // layout wrappers: recurse into children, drop the wrapper
    case 'css-box':
    case 'centered':
    case 'columns':
    case 'card':
      return bloksToMdx(
        blok.bloks ?? blok.items ?? blok.left ?? blok.children ?? [
          ...(blok.column1 ?? []),
          ...(blok.column2 ?? []),
        ],
      );
    // locale-aware donate CTA provided by the MDX component mapping
    case 'buy-me-a-racoon-button':
    case 'buy-me-a-coffe-button':
      return '<Donate />';
    // superseded by app UI: cache button, page grids
    case 'sw-clear-cache-button':
    case 'page-grid':
    case 'news':
    case 'tldr':
      return '';
    default:
      console.warn('  ! unmapped blok component:', blok.component);
      return '';
  }
}

/* ------------------------------ story loaders ----------------------------- */

async function loadStory(locale: string, rel: string): Promise<Json | null> {
  try {
    const raw = await fs.readFile(path.join(STORIES, locale, rel), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeMdx(relOut: string, frontmatter: Record<string, unknown>, body: string) {
  const target = path.join(CONTENT_OUT, relOut);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const fmLines = Object.entries(frontmatter)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) =>
      typeof v === 'string' ? `${k}: ${yamlString(v)}` : `${k}: ${JSON.stringify(v)}`,
    );
  const mdx = `---\n${fmLines.join('\n')}\n---\n\n${body.trim()}\n`;
  await fs.writeFile(target, mdx);
  console.log(`  wrote ${relOut}`);
}

/* ------------------------------- migrations ------------------------------- */

/**
 * Lightweight metadata manifest so the app can render navigation (guide step
 * lists, titles) without eagerly importing every MDX body.
 */
const manifest: Json = {};
function manifestFor(locale: string): Json {
  return (manifest[locale] ??= { pages: {}, guides: {} });
}

async function migrateSimplePage(locale: string, storyRel: string, outRel: string) {
  const story = await loadStory(locale, storyRel);
  if (!story) return console.warn(`  ! missing ${locale}/${storyRel}`);
  const c = story.content;
  const body = await bloksToMdx(c.bloks);
  const meta = {
    title: c.title || story.name,
    description: c.description || c.ogDescription || undefined,
  };
  manifestFor(locale).pages[path.basename(outRel, '.mdx')] = meta;
  await writeMdx(outRel, meta, body);
}

async function migrateAnalyzerPage(locale: string) {
  const story = await loadStory(locale, 'tools/tuning-tools/pro.json');
  if (!story) return console.warn(`  ! missing ${locale}/pro.json`);
  const c = story.content;
  // Keep only the analyzer blok and the "Guide Footer" snippet (sponsors +
  // credits). The "Guide Header" snippet (cache explainer + discord CTA) is
  // superseded by app UI.
  const kept: Json[] = [];
  for (const blok of c.bloks ?? []) {
    if (blok.component === 'blackbox-analyzer') kept.push(blok);
    if (
      blok.component === 'cms-snippet' &&
      /footer/i.test(blok.reference?.[0]?.name ?? '')
    ) {
      kept.push(blok);
    }
  }
  const body = await bloksToMdx(kept);
  const meta = {
    title: c.title || story.name,
    subtitle: c.subtitle || undefined,
    description: c.description || c.ogDescription || undefined,
  };
  manifestFor(locale).pages['analyzer'] = meta;
  await writeMdx(`${locale}/analyzer.mdx`, meta, body);
}

interface StepOut {
  index: string;
  order: number;
  slug: string;
  title: string;
  image?: string;
  body: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function migrateGuide(locale: string, storyRel: string, outDir: string) {
  const story = await loadStory(locale, storyRel);
  if (!story) return console.warn(`  ! missing ${locale}/${storyRel}`);
  const c = story.content;
  const inst = (c.bloks ?? []).find((b: Json) => b.component === 'instructions');
  if (!inst) return console.warn(`  ! no instructions blok in ${locale}/${storyRel}`);

  // guide landing (prerequisites)
  const prerequisites = (inst.prerequisitesItems ?? []).map((i: Json) => i.label);
  const preImage = inst.prerequisitesImage?.filename
    ? await downloadImage(inst.prerequisitesImage.filename)
    : undefined;

  const steps: StepOut[] = [];
  let order = 1;
  for (const rawStep of inst.steps ?? []) {
    // resolve shared steps: sourceStep embeds a snippet story whose items[]
    // hold the actual step blok(s)
    let step = rawStep;
    if (rawStep.sourceStep?.length) {
      const items = rawStep.sourceStep[0]?.content?.items ?? [];
      const shared = items[0] ?? {};
      step = {
        ...shared,
        // local fields (index) win over the shared step's own values
        index: rawStep.index || shared.index,
        title: rawStep.title || shared.title || rawStep.sourceStep[0]?.name,
        customBloks: [
          ...(shared.customBloks ?? []),
          ...(rawStep.customBloks ?? []),
        ],
      };
    }

    const bodyParts: string[] = [];
    const desc = await richtextToMdx(step.description);
    if (desc) bodyParts.push(desc);
    const custom = await bloksToMdx(step.customBloks);
    if (custom) bodyParts.push(custom);

    const image = step.image?.filename
      ? await downloadImage(step.image.filename)
      : undefined;
    const title: string = step.title ?? `Step ${step.index ?? order}`;

    steps.push({
      index: String(step.index ?? order),
      order,
      slug: slugify(`${title}`) || `step-${order}`,
      title,
      image,
      body: bodyParts.join('\n\n'),
    });
    order++;
  }

  const guideSlug = path.basename(outDir);
  const guideMeta = {
    title: c.title || story.name,
    subtitle: c.subtitle || undefined,
    description: c.description || c.ogDescription || undefined,
    prerequisitesTitle: inst.prerequisitesTitle || undefined,
    prerequisites: prerequisites.length ? prerequisites : undefined,
    prerequisitesImage: preImage,
    stepCount: steps.length,
  };
  manifestFor(locale).guides[guideSlug] = {
    ...guideMeta,
    steps: steps.map(({ body: _body, ...meta }) => meta),
  };
  await writeMdx(`${outDir}/index.mdx`, guideMeta, '');

  for (const s of steps) {
    await writeMdx(
      `${outDir}/steps/${String(s.order).padStart(2, '0')}-${s.slug}.mdx`,
      {
        title: s.title,
        index: s.index,
        order: s.order,
        slug: s.slug,
        image: s.image,
      },
      s.body,
    );
  }
}

/* ---------------------------------- main ---------------------------------- */

await fs.mkdir(IMAGES_OUT, { recursive: true });
for (const locale of LOCALES) {
  console.log(`\n=== ${locale} ===`);
  await migrateSimplePage(locale, 'imprint.json', `${locale}/imprint.mdx`);
  await migrateSimplePage(locale, 'data-privacy.json', `${locale}/data-privacy.mdx`);
  await migrateAnalyzerPage(locale);
  await migrateGuide(locale, 'tools/tuning-tools/noob/pid.json', `${locale}/guides/pid-tuning`);
  await migrateGuide(locale, 'tools/tuning-tools/noob/filter.json', `${locale}/guides/filter-tuning`);
}
await fs.writeFile(
  path.join(CONTENT_OUT, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log('\nDone (manifest.json written).');
