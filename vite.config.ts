import { UserConfig, defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";
import { qwikSpeakInline } from 'qwik-speak/inline';

process.env.HTTPS="true";
process.env.NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        rewriteRoutes: [
          {
            paths: {
              '/[...index]': '/',
            }
          },
        ]
      }),
      qwikVite(),
      tsconfigPaths(),
      // mkcert(),
      qwikSpeakInline({
        supportedLangs: ['en', 'de'],
        defaultLang: 'en',
        assetsPath: 'i18n'
      }),
    ],
    optimizeDeps: {
      exclude: ["@uav.painkillers/pid-analyzer-wasm"],
    },
  } as UserConfig;
});
