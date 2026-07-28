/**
 * Post-build service worker step (runs AFTER prerender so the precache
 * manifest includes the prerendered HTML):
 * 1. bundle apps/web/src/sw.ts with esbuild → dist/client/sw.js
 * 2. inject the precache manifest with workbox-build
 * 3. emit analyzer-deps-manifest.json (file list + sizes for the opt-in
 *    offline download of the analyzer runtime)
 *
 * Run: pnpm tsx tools/scripts/build-sw.mts
 */
import { build } from 'esbuild';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { injectManifest } from 'workbox-build';

const ROOT = path.resolve(import.meta.dirname, '../..');
const APP = path.join(ROOT, 'apps/web');
const DIST = path.join(APP, 'dist/client');
const DEPS_DIR = path.join(DIST, 'pid-analyzer-dependencies');

// 1. analyzer deps manifest (from the built output so URLs match reality)
async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

const depFiles = await walk(DEPS_DIR);
const files = await Promise.all(
  depFiles.map(async (file) => ({
    url: '/' + path.relative(DIST, file).split(path.sep).join('/'),
    size: (await fs.stat(file)).size,
  })),
);
const manifest = {
  files: files.sort((a, b) => a.url.localeCompare(b.url)),
  totalBytes: files.reduce((sum, f) => sum + f.size, 0),
};
await fs.writeFile(
  path.join(DIST, 'analyzer-deps-manifest.json'),
  JSON.stringify(manifest),
);
console.log(
  `analyzer-deps-manifest.json: ${files.length} files, ${(manifest.totalBytes / 1024 / 1024).toFixed(0)} MB`,
);

// 2. bundle the SW
await build({
  entryPoints: [path.join(APP, 'src/sw.ts')],
  outfile: path.join(DIST, 'sw.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' },
});

// 3. inject the precache manifest
const { count, size, warnings } = await injectManifest({
  swSrc: path.join(DIST, 'sw.js'),
  swDest: path.join(DIST, 'sw.js'),
  globDirectory: DIST,
  globPatterns: ['**/*.{js,css,html,webp,svg,png,ico,json,woff2}'],
  globIgnores: [
    'pid-analyzer-dependencies/**',
    'analyzer-deps-manifest.json',
    'mock-data.json.gz',
    'sw.js',
    // legacy kill switch: must always be fetched from the network, never
    // served out of the precache
    'service-worker.js',
    'pwa/html_code.html',
  ],
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
});
warnings.forEach((w) => console.warn('[workbox]', w));
console.log(
  `sw.js precache: ${count} files, ${(size / 1024 / 1024).toFixed(1)} MB`,
);
