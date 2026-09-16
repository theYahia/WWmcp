import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // E2E smoke needs dist/ and runs via vitest.e2e.config.ts.
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    // Vitest 4: restoreAllMocks() no longer resets vi.fn() state (calls, queued
    // mockResolvedValueOnce), which the shared module-level mockFetch relies on.
    mockReset: true,
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
});
