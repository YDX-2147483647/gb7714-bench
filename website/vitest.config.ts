import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    includeSource: ["app/**/*.ts", "plugin/*.ts"],
  },
});
