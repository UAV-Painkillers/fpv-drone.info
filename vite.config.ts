import { UserConfig, defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { builderDevTools } from "@builder.io/dev-tools/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { qwikReact } from "@builder.io/qwik-react/vite";

export default defineConfig(() => {
  return {
    plugins: [
      builderDevTools(),
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      qwikReact(),
    ],
    optimizeDeps: {
      exclude: ["@uav.painkillers/pid-analyzer-wasm"],
    },
  } as UserConfig;
});
