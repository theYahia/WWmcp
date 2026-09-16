import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // E2E smoke needs dist/ and runs via vitest.e2e.config.ts.
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
  },
});
