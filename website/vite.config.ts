import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { gitInfo } from "./plugin/git_info.ts";
import { loadFiles } from "./plugin/load_files.ts";

export default defineConfig({
  plugins: [loadFiles(), gitInfo(), tailwindcss(), reactRouter()],
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
