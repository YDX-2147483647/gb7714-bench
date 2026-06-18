import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    // https://vitest.dev/guide/in-source.html#production-build
    "import.meta.vitest": "undefined",
  },
});
