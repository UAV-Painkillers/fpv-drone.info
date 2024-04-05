const originalConfig = require("./workbox-config.cjs");

module.exports = {
  ...originalConfig,
  globDirectory: "dist",
  swSrc: "dist/service-worker.js",
  swDest: "dist/service-worker.js",
};
