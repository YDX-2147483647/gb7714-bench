import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { gitInfo } from "./plugin/git_info";
import { loadFiles } from "./plugin/load_files";

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
