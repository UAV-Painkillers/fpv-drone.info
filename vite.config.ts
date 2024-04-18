import { UserConfig, defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import { qwikReact } from "@builder.io/qwik-react/vite";
import mkcert from "vite-plugin-mkcert";

process.env.HTTPS="true";
process.env.NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      // qwikReact(),
      mkcert(),
    ],
    optimizeDeps: {
      exclude: ["@uav.painkillers/pid-analyzer-wasm"],
    },
  } as UserConfig;
});
