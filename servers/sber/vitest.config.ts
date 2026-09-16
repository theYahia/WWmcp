import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // e2e требует собранный dist — гоняется отдельно через test:e2e.
    exclude: ["tests/e2e/**"],
    testTimeout: 10_000,
  },
});
