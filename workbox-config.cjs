module.exports = {
  globDirectory: "dist",
  globPatterns: [
    // "**/*.{gif,gz,svg,js,json,whl,zip,wasm,mjs,png,xml,ico,html,webmanifest,txt,wasm,whl,zip,woff,woff2,jpg,jpeg,webp,css}",
    "**/*",
  ],
  // globIgnores: ["build/**/*"],
  // swSrc: ".vercel/output/static/service-worker.js",
  swSrc: "dist/service-worker.js",
  // swDest: ".vercel/output/static/service-worker.js",
  swDest: "dist/service-worker.js",
  // 50MB
  maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
};
