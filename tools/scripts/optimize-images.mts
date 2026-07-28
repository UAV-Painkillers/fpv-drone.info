/**
 * One-time asset optimization: converts the mascot PNGs and GIFs in
 * libs/ui/src/assets to (animated) WebP. Originals are deleted afterwards —
 * they remain retrievable from git history.
 *
 * Run: pnpm tsx tools/scripts/optimize-images.ts
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve(import.meta.dirname, '../../libs/ui/src/assets');

async function convertDir(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await convertDir(filePath);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (ext !== '.png' && ext !== '.gif') continue;

    const animated = ext === '.gif';
    const outPath = filePath.replace(/\.(png|gif)$/i, '.webp');
    const input = sharp(filePath, { animated });
    const meta = await input.metadata();
    // Cap still images at 1200px wide — mascots render at ≤600px CSS pixels.
    const resized =
      !animated && meta.width && meta.width > 1200
        ? input.resize({ width: 1200 })
        : input;
    await resized.webp({ quality: 82, effort: 6 }).toFile(outPath);

    const before = (await fs.stat(filePath)).size;
    const after = (await fs.stat(outPath)).size;
    console.log(
      `${path.relative(ASSETS_DIR, filePath)} → ${path.basename(outPath)}: ` +
        `${(before / 1024).toFixed(0)}kB → ${(after / 1024).toFixed(0)}kB`,
    );
    await fs.unlink(filePath);
  }
}

await convertDir(ASSETS_DIR);
