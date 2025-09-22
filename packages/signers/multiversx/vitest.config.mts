import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    mainFields: ["module"],
  },
  test: {
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
  },
});
