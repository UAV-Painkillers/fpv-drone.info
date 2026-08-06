# fpv-drone.info

**Free, in-browser FPV drone tuning tools.** Analyze Betaflight blackbox logs
(step response, noise heatmaps, response delay), follow step-by-step PID and
filter tuning guides, and calculate your dynamic idle — all client-side, no
uploads, no accounts. Available in English, German, Spanish, French and Polish.

A [UAV Painkillers](https://uav-painkillers.de) project. 🦝

## Stack

- **Nx monorepo** with pnpm workspaces
- **React 19 + Vite + TanStack Start** — every route is prerendered to static
  HTML (pure static hosting on Vercel, no server functions)
- **Tailwind CSS 4** design system with light/dark themes
- **MDX content** per locale (no CMS — content lives in this repo)
- **[@uav.painkillers/pid-analyzer-wasm](https://www.npmjs.com/package/@uav.painkillers/pid-analyzer-wasm)**
  — the PID analysis engine (Python via Pyodide, runs entirely in the browser)
- **Apache ECharts** for all plots
- **PWA** with offline support; the ~90 MB analyzer runtime is an opt-in
  offline download

## Workspace layout

```
apps/
  web/          the app: TanStack file routes, service worker, public assets
                (incl. the Pyodide analyzer runtime in pid-analyzer-dependencies/)
  web-e2e/      Playwright smoke tests against the built static output
libs/
  analyzer/     framework-free progress reducers + React hook around the WASM engine
  plots/        ECharts ResponsePlotter + React plot components
  ui/           design system: tokens, components, raccoon mascots
  content/      MDX content per locale + typed collections (zod-validated)
  i18n/         locales + typed UI-string dictionaries (compiler-enforced parity)
  pwa/          service-worker client, offline download card, install banner
tools/scripts/  build steps (service worker, sitemap/OG images) and utilities
```

## Development

```sh
pnpm install
pnpm nx dev @fpv/web          # dev server on http://localhost:4200
pnpm nx run-many -t lint typecheck test build
```

The production build prerenders all ~137 pages:

```sh
pnpm nx build web                          # static output in apps/web/dist/client
pnpm tsx tools/scripts/build-sw.mts        # service worker + analyzer deps manifest
pnpm tsx tools/scripts/generate-seo.mts    # sitemap.xml, robots.txt, OG images
node tools/scripts/serve-static.mjs        # preview on http://localhost:4300
```

E2E smoke suite (needs a prior build):

```sh
pnpm nx e2e @fpv/web-e2e
```

Tip: open `/en/tools/blackbox-analyzer/?mock-data` to see the plots with
canned analysis results without downloading the Pyodide runtime.

## Content & translations

All page content is MDX under `libs/content/src/{en,de,es,fr,pl}/`; guide
navigation metadata lives in `manifest.json` next to it. UI strings are typed
TypeScript dictionaries in `libs/i18n/src/messages/` — the `Messages` type
makes missing translations a compile error. Content was migrated once from
the old Storyblok CMS by `tools/scripts/migrate-storyblok.mts` (kept for
reference); the MDX files are now the single source of truth — edit them
directly.

## Deployment

Vercel builds via `vercel.json` (install → build → SW → SEO) and serves
`apps/web/dist/client` as a static site, including permanent redirects for
all legacy URLs. The only runtime configuration is the optional
`VITE_UMAMI_HOST` / `VITE_UMAMI_WEBSITE_ID` pair for self-hosted, cookieless,
ad-free analytics.

## Credits

Built on the groundwork of
[PID-Analyzer by Florian Melsheimer](https://github.com/Plasmatree/PID-Analyzer)
(via [VolkerGoeschl's fork](https://github.com/VolkerGoeschl/PID-Analyzer)) and
[blackbox-tools by the Cleanflight team](https://github.com/cleanflight/blackbox-tools).
Raccoon artwork by UAV Painkillers.

## Support

If these tools saved your tune, consider
[buying the raccoons a snack](https://buymeacoffee.com/uav.painkillers) ☕🦝
or join the [Discord](https://discord.gg/eBv6Mke9NS).
