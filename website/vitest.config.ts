import { defineConfig } from "vitest/config";

import { loadFiles } from "./plugin/load_files";

export default defineConfig({
  test: {
    environment: "node",
    includeSource: ["app/**/*.ts", "plugin/*.ts"],
  },
  plugins: [loadFiles()],
});
