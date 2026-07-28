/**
 * Post-build SEO artifacts (run after `nx build web`):
 * - sitemap.xml with hreflang alternates for every prerendered route
 * - robots.txt
 * - OG images (1200×630 PNG) per locale × page via satori + resvg
 *
 * Run: pnpm tsx tools/scripts/generate-seo.mts
 */
import { Resvg } from '@resvg/resvg-js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DIST = path.join(ROOT, 'apps/web/dist/client');
const ORIGIN = 'https://fpv-drone.info';
const LOCALES = ['en', 'de', 'es', 'fr', 'pl'] as const;

const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'libs/content/src/manifest.json'), 'utf8'),
);

/* ------------------------------ page catalog ------------------------------ */

interface PageDef {
  path: string; // without locale prefix; '' = home
  ogSlug: string; // /og/{locale}/{ogSlug}.png
  title: (locale: string) => string;
  mascot: string; // asset filename in libs/ui/src/assets
}

const TITLES: Record<string, Record<string, string>> = {
  home: {
    en: 'Your FPV tuning toolbox',
    de: 'Dein FPV-Tuning-Werkzeugkasten',
    es: 'Tu caja de herramientas FPV',
    fr: 'Votre boîte à outils FPV',
    pl: 'Twoja skrzynka narzędziowa FPV',
  },
  tools: { en: 'Tools', de: 'Tools', es: 'Herramientas', fr: 'Outils', pl: 'Narzędzia' },
  analyzer: {
    en: 'Blackbox Analyzer',
    de: 'Blackbox-Analyzer',
    es: 'Analizador de Blackbox',
    fr: 'Analyseur de blackbox',
    pl: 'Analizator blackboxa',
  },
  calculator: {
    en: 'Dynamic Idle Calculator',
    de: 'Dynamic-Idle-Rechner',
    es: 'Calculadora de Dynamic Idle',
    fr: 'Calculateur de Dynamic Idle',
    pl: 'Kalkulator Dynamic Idle',
  },
  guides: { en: 'Guides', de: 'Guides', es: 'Guías', fr: 'Guides', pl: 'Poradniki' },
};

const PAGES: PageDef[] = [
  { path: '', ogSlug: 'home', title: (l) => TITLES['home']![l]!, mascot: 'racoon_friends_cropped.webp' },
  { path: '/tools', ogSlug: 'tools', title: (l) => TITLES['tools']![l]!, mascot: 'racoon_direction_cropped.webp' },
  { path: '/tools/blackbox-analyzer', ogSlug: 'tools/blackbox-analyzer', title: (l) => TITLES['analyzer']![l]!, mascot: 'racoon_scientist_chichi_pro_cropped.webp' },
  { path: '/tools/dynamic-idle-calculator', ogSlug: 'tools/dynamic-idle-calculator', title: (l) => TITLES['calculator']![l]!, mascot: 'racoon_direction_cropped.webp' },
  { path: '/guides', ogSlug: 'guides', title: (l) => TITLES['guides']![l]!, mascot: 'racoon_magician_pablo_noob_cropped.webp' },
  { path: '/guides/pid-tuning', ogSlug: 'guides/pid-tuning', title: (l) => manifest[l].guides['pid-tuning'].title, mascot: 'racoon_direction_cropped_pid.webp' },
  { path: '/guides/filter-tuning', ogSlug: 'guides/filter-tuning', title: (l) => manifest[l].guides['filter-tuning'].title, mascot: 'racoon_direction_cropped_filter.webp' },
  { path: '/imprint', ogSlug: 'imprint', title: (l) => manifest[l].pages['imprint'].title, mascot: 'racoon_friends_cropped.webp' },
  { path: '/data-privacy', ogSlug: 'data-privacy', title: (l) => manifest[l].pages['data-privacy'].title, mascot: 'racoon_friends_cropped.webp' },
];

/* -------------------------------- sitemap -------------------------------- */

function urlEntry(pathNoLocale: string, locale: string): string {
  const alternates = LOCALES.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l}${pathNoLocale}"/>`,
  ).join('\n');
  return `  <url>
    <loc>${ORIGIN}/${locale}${pathNoLocale}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/en${pathNoLocale}"/>
  </url>`;
}

const allPaths: string[] = [
  ...PAGES.map((p) => p.path),
  ...Object.entries(manifest.en.guides).flatMap(([slug]) => []),
];
// wizard steps (per locale slugs differ, so enumerate per locale below)
const entries: string[] = [];
for (const locale of LOCALES) {
  for (const p of allPaths) entries.push(urlEntry(p, locale));
  for (const [guideSlug, guide] of Object.entries(
    manifest[locale].guides as Record<string, { steps: { slug: string }[] }>,
  )) {
    for (const step of guide.steps) {
      // localized step slugs have no cross-locale equivalent; emit without alternates
      entries.push(`  <url>
    <loc>${ORIGIN}/${locale}/guides/${guideSlug}/${step.slug}</loc>
  </url>`);
    }
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
console.log(`sitemap.xml: ${entries.length} urls`);

await fs.writeFile(
  path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
);
console.log('robots.txt written');

/* -------------------------------- OG images ------------------------------- */

const font = await fs.readFile(path.join(ROOT, 'tools/assets/Montserrat-Bold.ttf'));
const mascotCache = new Map<string, string>();
async function mascotDataUri(name: string): Promise<string> {
  let cached = mascotCache.get(name);
  if (!cached) {
    // satori doesn't decode webp — hand it a png
    const buf = await sharp(path.join(ROOT, 'libs/ui/src/assets', name))
      .png()
      .toBuffer();
    cached = `data:image/png;base64,${buf.toString('base64')}`;
    mascotCache.set(name, cached);
  }
  return cached;
}

function h(type: string, props: Record<string, unknown>, ...children: unknown[]) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

async function renderOg(title: string, mascot: string, outFile: string) {
  const svg = await satori(
    h(
      'div',
      {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '70px',
          background: 'linear-gradient(135deg, #0d1117 0%, #10231f 55%, #16c99e33 100%)',
          color: '#ffffff',
          fontFamily: 'Montserrat',
        },
      },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', maxWidth: '720px' } },
        h(
          'div',
          { style: { display: 'flex', fontSize: '34px', color: '#16c99e' } },
          'fpv-drone.info',
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: title.length > 24 ? '64px' : '80px',
              lineHeight: 1.1,
              marginTop: '18px',
            },
          },
          title,
        ),
        h(
          'div',
          { style: { display: 'flex', fontSize: '26px', color: '#9aa1ac', marginTop: '24px' } },
          'Free in-browser FPV tuning tools',
        ),
      ),
      h('img', {
        src: await mascotDataUri(mascot),
        height: 420,
        style: { objectFit: 'contain' },
      }),
    ),
    { width: 1200, height: 630, fonts: [{ name: 'Montserrat', data: font, weight: 700, style: 'normal' }] },
  );
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, png);
}

let ogCount = 0;
for (const locale of LOCALES) {
  for (const page of PAGES) {
    const out = path.join(DIST, 'og', locale, `${page.ogSlug}.png`);
    await renderOg(page.title(locale), page.mascot, out);
    ogCount++;
  }
}
console.log(`OG images: ${ogCount}`);
