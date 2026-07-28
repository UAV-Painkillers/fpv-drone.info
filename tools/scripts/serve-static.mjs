/**
 * Minimal static file server for the built app (tests / local preview).
 * Usage: node tools/scripts/serve-static.mjs [port] [dir]
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const port = Number(process.argv[2] ?? 4300);
const root = path.resolve(process.argv[3] ?? 'apps/web/dist/client');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let filePath = path.join(root, decodeURIComponent(url.pathname));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (!existsSync(filePath)) {
      const notFound = path.join(root, '404.html');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      if (existsSync(notFound)) createReadStream(notFound).pipe(res);
      else res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(filePath)] ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(res);
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
