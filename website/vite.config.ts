import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { loadFiles } from "./plugin/load_files";

export default defineConfig({
  plugins: [loadFiles(), tailwindcss(), reactRouter()],
  ssr: {
    // react-shiki does not support SSR because it imports CSS from JS.
    // Without this config, the following error will occur.
    //   [vite] Internal server error: Unknown file extension ".css" for ***/node_modules/.pnpm/react-shiki@***/node_modules/react-shiki/dist/style.css
    noExternal: ["react-shiki"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    // https://vitest.dev/guide/in-source.html#production-build
    "import.meta.vitest": "undefined",
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
